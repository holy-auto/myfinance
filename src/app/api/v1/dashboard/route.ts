import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";

export async function GET() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
  const yearStart = new Date(currentYear, 0, 1);

  const [
    monthlyEntryCount,
    pendingCount,
    closingPeriod,
    revenueLines,
    expenseLines,
    cashLines,
    receivableLines,
    payableLines,
    unmatchedTxCount,
    activeRulesCount,
    counterpartyCount,
    bankAccountCount,
    monthlyTrendRaw,
  ] = await Promise.all([
    prisma.journalEntry.count({
      where: { fiscalYear: currentYear, fiscalMonth: currentMonth },
    }),
    prisma.journalEntry.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.closingPeriod.findUnique({
      where: { fiscalYear_fiscalMonth: { fiscalYear: currentYear, fiscalMonth: currentMonth } },
    }),
    prisma.journalLine.findMany({
      where: {
        journalEntry: { entryDate: { gte: yearStart, lte: monthEnd }, status: "APPROVED" },
        account: { type: "REVENUE" },
      },
      include: { account: { select: { code: true } } },
    }),
    prisma.journalLine.findMany({
      where: {
        journalEntry: { entryDate: { gte: yearStart, lte: monthEnd }, status: "APPROVED" },
        account: { type: "EXPENSE" },
      },
      include: { account: { select: { code: true } } },
    }),
    prisma.journalLine.findMany({
      where: {
        journalEntry: { entryDate: { lte: monthEnd }, status: "APPROVED" },
        account: { code: { in: ["1100", "1110", "1120"] } },
      },
    }),
    prisma.journalLine.findMany({
      where: {
        journalEntry: { entryDate: { lte: monthEnd }, status: "APPROVED" },
        account: { code: "1200" },
      },
    }),
    prisma.journalLine.findMany({
      where: {
        journalEntry: { entryDate: { lte: monthEnd }, status: "APPROVED" },
        account: { code: "2100" },
      },
    }),
    prisma.bankTransaction.count({ where: { status: "UNMATCHED" } }),
    prisma.journalRule.count({ where: { isActive: true } }),
    prisma.counterparty.count({ where: { isActive: true } }),
    prisma.bankAccount.count({ where: { isActive: true } }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(currentYear, currentMonth - 1 - (5 - i), 1);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const mStart = new Date(y, m - 1, 1);
        const mEnd = new Date(y, m, 0, 23, 59, 59);
        return Promise.all([
          prisma.journalLine.findMany({
            where: {
              journalEntry: { entryDate: { gte: mStart, lte: mEnd }, status: "APPROVED" },
              account: { type: "REVENUE" },
            },
            select: { debit: true, credit: true },
          }),
          prisma.journalLine.findMany({
            where: {
              journalEntry: { entryDate: { gte: mStart, lte: mEnd }, status: "APPROVED" },
              account: { type: "EXPENSE" },
            },
            select: { debit: true, credit: true },
          }),
        ]).then(([rev, exp]) => ({ y, m, rev, exp }));
      })
    ),
  ]);

  const sumLines = (lines: { debit: { toString(): string }; credit: { toString(): string } }[]) =>
    lines.reduce(
      (s, l) =>
        s.plus(new Decimal(l.debit.toString())).minus(new Decimal(l.credit.toString())),
      new Decimal(0)
    );

  const totalRevenue = revenueLines
    .reduce(
      (s, l) => s.plus(new Decimal(l.credit.toString())).minus(new Decimal(l.debit.toString())),
      new Decimal(0)
    )
    .toNumber();

  const totalCostOfSales = expenseLines
    .filter((l) => l.account.code.startsWith("5"))
    .reduce(
      (s, l) => s.plus(new Decimal(l.debit.toString())).minus(new Decimal(l.credit.toString())),
      new Decimal(0)
    )
    .toNumber();
  const totalSga = expenseLines
    .filter((l) => l.account.code.startsWith("6"))
    .reduce(
      (s, l) => s.plus(new Decimal(l.debit.toString())).minus(new Decimal(l.credit.toString())),
      new Decimal(0)
    )
    .toNumber();
  const totalExpense = expenseLines
    .reduce(
      (s, l) => s.plus(new Decimal(l.debit.toString())).minus(new Decimal(l.credit.toString())),
      new Decimal(0)
    )
    .toNumber();
  const grossProfit = totalRevenue - totalCostOfSales;
  const operatingProfit = grossProfit - totalSga;

  const cashBalance = sumLines(cashLines).toNumber();
  const receivableBalance = sumLines(receivableLines).toNumber();
  const payableBalance = -sumLines(payableLines).toNumber();

  const monthlyTrend = monthlyTrendRaw.map(({ y, m, rev, exp }) => {
    const revenue = rev
      .reduce(
        (s, l) => s.plus(new Decimal(l.credit.toString())).minus(new Decimal(l.debit.toString())),
        new Decimal(0)
      )
      .toNumber();
    const expense = exp
      .reduce(
        (s, l) => s.plus(new Decimal(l.debit.toString())).minus(new Decimal(l.credit.toString())),
        new Decimal(0)
      )
      .toNumber();
    return {
      month: `${y}/${String(m).padStart(2, "0")}`,
      revenue,
      expense,
      profit: revenue - expense,
    };
  });

  return NextResponse.json({
    monthlyEntryCount,
    pendingCount,
    closingStatus: closingPeriod?.status ?? "OPEN",
    totalRevenue,
    totalExpense,
    grossProfit,
    operatingProfit,
    cashBalance,
    receivableBalance,
    payableBalance,
    unmatchedTxCount,
    activeRulesCount,
    counterpartyCount,
    bankAccountCount,
    monthlyTrend,
  });
}
