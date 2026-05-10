"use server";

import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { createAuditLog } from "@/services/audit.service";
import { parseCsv } from "@/lib/csv";
import { revalidatePath } from "next/cache";

export type ImportLine = {
  rowNumber: number;
  entryDate: string;
  description: string;
  debitCode: string;
  debitAmount: number;
  creditCode: string;
  creditAmount: number;
  counterparty?: string;
  taxCategory?: string;
};

export type ImportPreview = {
  totalRows: number;
  validRows: number;
  errors: { row: number; message: string }[];
  preview: ImportLine[];
};

const COLS = {
  date: ["日付", "伝票日付", "date"],
  description: ["摘要", "description", "memo"],
  debit: ["借方科目", "借方", "debit"],
  debitAmount: ["借方金額", "debit_amount"],
  credit: ["貸方科目", "貸方", "credit"],
  creditAmount: ["貸方金額", "credit_amount"],
  counterparty: ["取引先", "counterparty"],
  taxCategory: ["税区分", "tax"],
};

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== "") return row[k];
  }
  return "";
}

function parseAmount(v: string): number {
  if (!v) return 0;
  const cleaned = v.replace(/[,¥\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export async function previewImportAction(formData: FormData): Promise<ImportPreview> {
  await requirePermission(PERMISSIONS.IMPORT_MANAGE);
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("ファイルが指定されていません");
  const text = await file.text();
  const { rows } = parseCsv(text);

  const errors: { row: number; message: string }[] = [];
  const preview: ImportLine[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNumber = i + 2;
    const dateRaw = pick(r, COLS.date);
    const desc = pick(r, COLS.description);
    const debitCode = pick(r, COLS.debit);
    const creditCode = pick(r, COLS.credit);
    const debitAmount = parseAmount(pick(r, COLS.debitAmount));
    const creditAmount = parseAmount(pick(r, COLS.creditAmount));

    if (!dateRaw) { errors.push({ row: rowNumber, message: "日付が空です" }); continue; }
    if (!desc) { errors.push({ row: rowNumber, message: "摘要が空です" }); continue; }
    if (!debitCode || !creditCode) { errors.push({ row: rowNumber, message: "借方/貸方科目が空です" }); continue; }
    const amount = debitAmount > 0 ? debitAmount : creditAmount;
    if (amount <= 0) { errors.push({ row: rowNumber, message: "金額が0以下です" }); continue; }
    if (debitAmount > 0 && creditAmount > 0 && debitAmount !== creditAmount) {
      errors.push({ row: rowNumber, message: `借方${debitAmount}と貸方${creditAmount}が不一致です` });
      continue;
    }
    const finalDebit = debitAmount > 0 ? debitAmount : amount;
    const finalCredit = creditAmount > 0 ? creditAmount : amount;
    preview.push({
      rowNumber,
      entryDate: dateRaw,
      description: desc,
      debitCode,
      debitAmount: finalDebit,
      creditCode,
      creditAmount: finalCredit,
      counterparty: pick(r, COLS.counterparty) || undefined,
      taxCategory: pick(r, COLS.taxCategory) || undefined,
    });
  }

  return {
    totalRows: rows.length,
    validRows: preview.length,
    errors,
    preview,
  };
}

async function getOrCreateNumber(year: number): Promise<string> {
  const last = await prisma.journalEntry.findFirst({
    where: { fiscalYear: year, entryNumber: { startsWith: `JE-${year}-` } },
    orderBy: { entryNumber: "desc" },
    select: { entryNumber: true },
  });
  let seq = 1;
  if (last) {
    const parts = last.entryNumber.split("-");
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `JE-${year}-${String(seq).padStart(4, "0")}`;
}

export async function commitImportAction(linesJson: string) {
  const user = await requirePermission(PERMISSIONS.IMPORT_MANAGE);
  const lines = JSON.parse(linesJson) as ImportLine[];
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("取込対象がありません");
  }

  const codes = [...new Set(lines.flatMap((l) => [l.debitCode, l.creditCode]))];
  const accounts = await prisma.account.findMany({
    where: { code: { in: codes }, isActive: true, isSummary: false },
  });
  const accountMap = new Map(accounts.map((a) => [a.code, a]));

  const counterpartyNames = [...new Set(lines.map((l) => l.counterparty).filter((v): v is string => !!v))];
  const counterparties = await prisma.counterparty.findMany({
    where: { name: { in: counterpartyNames } },
  });
  const cpMap = new Map(counterparties.map((c) => [c.name, c]));

  let created = 0;
  const errors: string[] = [];

  for (const ln of lines) {
    const debit = accountMap.get(ln.debitCode);
    const credit = accountMap.get(ln.creditCode);
    if (!debit || !credit) {
      errors.push(`行${ln.rowNumber}: 勘定科目コードが見つかりません(${ln.debitCode}/${ln.creditCode})`);
      continue;
    }

    const dt = new Date(ln.entryDate);
    if (isNaN(dt.getTime())) {
      errors.push(`行${ln.rowNumber}: 日付形式が不正(${ln.entryDate})`);
      continue;
    }
    const fy = dt.getFullYear();
    const fm = dt.getMonth() + 1;

    const closing = await prisma.closingPeriod.findUnique({
      where: { fiscalYear_fiscalMonth: { fiscalYear: fy, fiscalMonth: fm } },
    });
    if (closing?.status === "CLOSED") {
      errors.push(`行${ln.rowNumber}: ${fy}年${fm}月は締め済みです`);
      continue;
    }

    const debitAmt = new Decimal(ln.debitAmount);
    const creditAmt = new Decimal(ln.creditAmount);
    if (!debitAmt.equals(creditAmt)) {
      errors.push(`行${ln.rowNumber}: 借方と貸方が一致しません`);
      continue;
    }

    try {
      const entryNumber = await getOrCreateNumber(fy);
      await prisma.journalEntry.create({
        data: {
          entryNumber,
          entryDate: dt,
          description: ln.description,
          fiscalYear: fy,
          fiscalMonth: fm,
          source: "CSV_IMPORT",
          counterpartyId: ln.counterparty ? cpMap.get(ln.counterparty)?.id : undefined,
          createdById: user.id,
          lines: {
            create: [
              {
                accountId: debit.id,
                debit: debitAmt.toNumber(),
                credit: 0,
                description: ln.description,
                taxCategory: ln.taxCategory,
                lineOrder: 0,
              },
              {
                accountId: credit.id,
                debit: 0,
                credit: creditAmt.toNumber(),
                description: ln.description,
                taxCategory: ln.taxCategory,
                lineOrder: 1,
              },
            ],
          },
        },
      });
      created++;
    } catch (e) {
      errors.push(`行${ln.rowNumber}: ${e instanceof Error ? e.message : "保存エラー"}`);
    }
  }

  await createAuditLog({
    userId: user.id,
    action: "IMPORT",
    entityType: "JournalEntry",
    entityId: "BATCH",
    changes: { created, errorCount: errors.length },
  });

  revalidatePath("/journal");
  return { created, errors };
}
