import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import type { JournalEntryCreateInput } from "@/lib/validators/journal";

async function generateEntryNumber(fiscalYear: number): Promise<string> {
  const lastEntry = await prisma.journalEntry.findFirst({
    where: { fiscalYear },
    orderBy: { entryNumber: "desc" },
    select: { entryNumber: true },
  });

  let seq = 1;
  if (lastEntry) {
    const parts = lastEntry.entryNumber.split("-");
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `JE-${fiscalYear}-${String(seq).padStart(4, "0")}`;
}

export async function createJournalEntry(
  input: JournalEntryCreateInput,
  userId: string
) {
  // Validate balance
  const totalDebit = input.lines.reduce(
    (sum, l) => sum.plus(l.debit),
    new Decimal(0)
  );
  const totalCredit = input.lines.reduce(
    (sum, l) => sum.plus(l.credit),
    new Decimal(0)
  );

  if (!totalDebit.equals(totalCredit)) {
    throw new Error("借方合計と貸方合計が一致しません");
  }

  const entryDate = new Date(input.entryDate);
  const fiscalYear = entryDate.getFullYear();
  const fiscalMonth = entryDate.getMonth() + 1;

  // Check closing period
  const closingPeriod = await prisma.closingPeriod.findUnique({
    where: {
      fiscalYear_fiscalMonth: { fiscalYear, fiscalMonth },
    },
  });

  if (closingPeriod?.status === "CLOSED") {
    throw new Error("この期間は締め済みです。取消仕訳で対応してください");
  }

  // Validate accounts exist and are active
  const accountIds = [...new Set(input.lines.map((l) => l.accountId))];
  const accounts = await prisma.account.findMany({
    where: { id: { in: accountIds }, isActive: true, isSummary: false },
  });

  if (accounts.length !== accountIds.length) {
    throw new Error("無効な勘定科目が含まれています");
  }

  const entryNumber = await generateEntryNumber(fiscalYear);

  return prisma.journalEntry.create({
    data: {
      entryNumber,
      entryDate,
      description: input.description,
      fiscalYear,
      fiscalMonth,
      businessUnitId: input.businessUnitId ?? undefined,
      projectId: input.projectId ?? undefined,
      createdById: userId,
      lines: {
        create: input.lines.map((line, index) => ({
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
          description: line.description,
          taxCategory: line.taxCategory,
          departmentId: line.departmentId ?? undefined,
          businessUnitId: line.businessUnitId ?? undefined,
          projectId: line.projectId ?? undefined,
          lineOrder: index,
        })),
      },
    },
    include: { lines: { include: { account: true } } },
  });
}

export async function submitForApproval(entryId: string) {
  const entry = await prisma.journalEntry.findUnique({
    where: { id: entryId },
    include: { lines: true },
  });

  if (!entry) throw new Error("仕訳が見つかりません");
  if (entry.status !== "DRAFT") throw new Error("下書き状態のみ提出できます");
  if (entry.lines.length < 2) throw new Error("最低2行の明細が必要です");

  return prisma.journalEntry.update({
    where: { id: entryId },
    data: { status: "PENDING_APPROVAL" },
  });
}

export async function approveEntry(entryId: string, userId: string) {
  const entry = await prisma.journalEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) throw new Error("仕訳が見つかりません");
  if (entry.status !== "PENDING_APPROVAL")
    throw new Error("承認待ち状態のみ承認できます");

  return prisma.journalEntry.update({
    where: { id: entryId },
    data: {
      status: "APPROVED",
      approvedById: userId,
      approvedAt: new Date(),
    },
  });
}

export async function rejectEntry(
  entryId: string,
  userId: string,
  reason: string
) {
  const entry = await prisma.journalEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) throw new Error("仕訳が見つかりません");
  if (entry.status !== "PENDING_APPROVAL")
    throw new Error("承認待ち状態のみ却下できます");

  return prisma.journalEntry.update({
    where: { id: entryId },
    data: {
      status: "REJECTED",
      approvedById: userId,
      rejectedReason: reason,
    },
  });
}
