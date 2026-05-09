"use server";

import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { bankAccountCreateSchema } from "@/lib/validators/master";
import { createAuditLog } from "@/services/audit.service";
import { parseCsv } from "@/lib/csv";
import { revalidatePath } from "next/cache";

function parseBankAccount(fd: FormData) {
  const raw = Object.fromEntries(fd.entries());
  const cleaned: Record<string, unknown> = { ...raw };
  for (const k of Object.keys(cleaned)) {
    if (cleaned[k] === "") cleaned[k] = null;
  }
  cleaned.openingBalance = raw.openingBalance ? Number(raw.openingBalance) : 0;
  cleaned.isActive = raw.isActive !== "false";
  return bankAccountCreateSchema.parse(cleaned);
}

export async function createBankAccountAction(fd: FormData) {
  const user = await requirePermission(PERMISSIONS.BANK_MANAGE);
  const data = parseBankAccount(fd);
  const created = await prisma.bankAccount.create({
    data: {
      code: data.code,
      name: data.name,
      type: data.type,
      bankName: data.bankName ?? undefined,
      branchName: data.branchName ?? undefined,
      accountNumber: data.accountNumber ?? undefined,
      linkedAccountId: data.linkedAccountId ?? undefined,
      openingBalance: data.openingBalance,
      isActive: data.isActive,
    },
  });
  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "BankAccount",
    entityId: created.id,
    changes: data as unknown as Record<string, unknown>,
  });
  revalidatePath("/bank");
  return created;
}

export async function importBankCsvAction(fd: FormData) {
  const user = await requirePermission(PERMISSIONS.BANK_MANAGE);
  const file = fd.get("file") as File | null;
  const bankAccountId = String(fd.get("bankAccountId") ?? "");
  if (!file || !bankAccountId) throw new Error("ファイルと口座を指定してください");

  const text = await file.text();
  const { rows } = parseCsv(text);
  if (rows.length === 0) throw new Error("CSVが空です");

  const batchId = `BNK-${Date.now()}`;
  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const dateStr = r["日付"] || r["date"] || r["取引日"];
    const desc = r["摘要"] || r["description"] || r["内容"] || "";
    const inAmount = Number((r["入金"] || r["入金額"] || r["amount_in"] || "0").replace(/[,¥]/g, ""));
    const outAmount = Number((r["出金"] || r["出金額"] || r["amount_out"] || "0").replace(/[,¥]/g, ""));
    const balance = (r["残高"] || r["balance"] || "").replace(/[,¥]/g, "");

    if (!dateStr) {
      errors.push(`行${i + 2}: 日付が空です`);
      continue;
    }
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) {
      errors.push(`行${i + 2}: 日付形式が不正(${dateStr})`);
      continue;
    }
    if (inAmount === 0 && outAmount === 0) {
      errors.push(`行${i + 2}: 入金/出金が両方0です`);
      continue;
    }

    try {
      await prisma.bankTransaction.create({
        data: {
          bankAccountId,
          txDate: dt,
          description: desc || "(摘要なし)",
          amountIn: inAmount,
          amountOut: outAmount,
          balance: balance ? new Decimal(balance).toNumber() : null,
          importBatchId: batchId,
          status: "UNMATCHED",
        },
      });
      imported++;
    } catch (e) {
      errors.push(`行${i + 2}: ${e instanceof Error ? e.message : "保存失敗"}`);
    }
  }

  await createAuditLog({
    userId: user.id,
    action: "IMPORT",
    entityType: "BankTransaction",
    entityId: batchId,
    changes: { imported, errors: errors.length, bankAccountId },
  });

  revalidatePath("/bank");
  return { imported, errors };
}

export async function autoMatchAction(bankAccountId?: string) {
  const user = await requirePermission(PERMISSIONS.BANK_MANAGE);
  const txs = await prisma.bankTransaction.findMany({
    where: {
      status: "UNMATCHED",
      ...(bankAccountId ? { bankAccountId } : {}),
    },
    include: { bankAccount: true },
  });

  let matched = 0;
  for (const tx of txs) {
    const amount = new Decimal(tx.amountIn.toString()).gt(0)
      ? new Decimal(tx.amountIn.toString())
      : new Decimal(tx.amountOut.toString());
    const dayStart = new Date(tx.txDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(tx.txDate);
    dayEnd.setHours(23, 59, 59, 999);
    const wideStart = new Date(dayStart);
    wideStart.setDate(wideStart.getDate() - 3);
    const wideEnd = new Date(dayEnd);
    wideEnd.setDate(wideEnd.getDate() + 3);

    const candidates = await prisma.journalEntry.findMany({
      where: {
        entryDate: { gte: wideStart, lte: wideEnd },
        status: { in: ["DRAFT", "PENDING_APPROVAL", "APPROVED"] },
        bankTransactions: { none: {} },
      },
      include: { lines: { include: { account: true } } },
      take: 50,
    });

    let bestMatch: typeof candidates[number] | null = null;
    for (const e of candidates) {
      const lineTotal = e.lines.reduce(
        (s, l) => s.plus(new Decimal(l.debit.toString())).plus(new Decimal(l.credit.toString())),
        new Decimal(0)
      );
      if (lineTotal.dividedBy(2).equals(amount)) {
        bestMatch = e;
        break;
      }
    }

    if (bestMatch) {
      await prisma.bankTransaction.update({
        where: { id: tx.id },
        data: { status: "MATCHED", matchedJournalId: bestMatch.id },
      });
      matched++;
    }
  }

  await createAuditLog({
    userId: user.id,
    action: "AUTO_MATCH",
    entityType: "BankTransaction",
    entityId: bankAccountId ?? "ALL",
    changes: { matched, total: txs.length },
  });

  revalidatePath("/bank");
  return { matched, total: txs.length };
}

export async function manualMatchAction(txId: string, journalId: string) {
  const user = await requirePermission(PERMISSIONS.BANK_MANAGE);
  await prisma.bankTransaction.update({
    where: { id: txId },
    data: { status: "MATCHED", matchedJournalId: journalId },
  });
  await createAuditLog({
    userId: user.id,
    action: "MANUAL_MATCH",
    entityType: "BankTransaction",
    entityId: txId,
    changes: { journalId },
  });
  revalidatePath("/bank");
}

export async function ignoreTransactionAction(txId: string) {
  const user = await requirePermission(PERMISSIONS.BANK_MANAGE);
  await prisma.bankTransaction.update({
    where: { id: txId },
    data: { status: "IGNORED", matchedJournalId: null },
  });
  await createAuditLog({
    userId: user.id,
    action: "IGNORE",
    entityType: "BankTransaction",
    entityId: txId,
  });
  revalidatePath("/bank");
}

export async function unmatchTransactionAction(txId: string) {
  const user = await requirePermission(PERMISSIONS.BANK_MANAGE);
  await prisma.bankTransaction.update({
    where: { id: txId },
    data: { status: "UNMATCHED", matchedJournalId: null },
  });
  await createAuditLog({
    userId: user.id,
    action: "UNMATCH",
    entityType: "BankTransaction",
    entityId: txId,
  });
  revalidatePath("/bank");
}
