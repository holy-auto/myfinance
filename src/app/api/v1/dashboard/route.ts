import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthStart = new Date(currentYear, currentMonth - 1, 1);
  const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
  const yearStart = new Date(currentYear, 0, 1);

  // 今月仕訳件数
  const monthlyEntryCount = await prisma.journalEntry.count({
    where: { fiscalYear: currentYear, fiscalMonth: currentMonth },
  });

  // 承認待ち
  const pendingCount = await prisma.journalEntry.count({
    where: { status: "PENDING_APPROVAL" },
  });

  // 今月の月次締めステータス
  const closingPeriod = await prisma.closingPeriod.findUnique({
    where: { fiscalYear_fiscalMonth: { fiscalYear: currentYear, fiscalMonth: currentMonth } },
  });

  // 当期売上・費用 (承認済みのみ)
  const revenueLines = await prisma.journalLine.findMany({
    where: {
      journalEntry: { entryDate: { gte: yearStart, lte: monthEnd }, status: "APPROVED" },
      account: { type: "REVENUE" },
    },
    include: { account: { select: { code: true } } },
  });
  const expenseLines = await prisma.journalLine.findMany({
    where: {
      journalEntry: { entryDate: { gte: yearStart, lte: monthEnd }, status: "APPROVED" },
      account: { type: "EXPENSE" },
    },
    include: { account: { select: { code: true } } },
  });

  const totalRevenue = revenueLines.reduce((s, l) => s + Number(l.credit) - Number(l.debit), 0);
  const totalCostOfSales = expenseLines.filter((l) => l.account.code.startsWith("5")).reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0);
  const totalSga = expenseLines.filter((l) => l.account.code.startsWith("6")).reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0);
  const totalExpense = expenseLines.reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0);
  const grossProfit = totalRevenue - totalCostOfSales;
  const operatingProfit = grossProfit - totalSga;

  // 普通預金残高
  const cashLines = await prisma.journalLine.findMany({
    where: {
      journalEntry: { entryDate: { lte: monthEnd }, status: "APPROVED" },
      account: { code: { in: ["1100", "1110", "1120"] } },
    },
  });
  const cashBalance = cashLines.reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0);

  // 月次推移 (直近6ヶ月)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const mStart = new Date(y, m - 1, 1);
    const mEnd = new Date(y, m, 0, 23, 59, 59);

    const revLines = await prisma.journalLine.findMany({
      where: { journalEntry: { entryDate: { gte: mStart, lte: mEnd }, status: "APPROVED" }, account: { type: "REVENUE" } },
    });
    const expLines = await prisma.journalLine.findMany({
      where: { journalEntry: { entryDate: { gte: mStart, lte: mEnd }, status: "APPROVED" }, account: { type: "EXPENSE" } },
    });
    const rev = revLines.reduce((s, l) => s + Number(l.credit) - Number(l.debit), 0);
    const exp = expLines.reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0);

    monthlyTrend.push({ month: `${y}/${String(m).padStart(2, "0")}`, revenue: rev, expense: exp, profit: rev - exp });
  }

  return NextResponse.json({
    monthlyEntryCount,
    pendingCount,
    closingStatus: closingPeriod?.status ?? "OPEN",
    totalRevenue,
    totalExpense,
    grossProfit,
    operatingProfit,
    cashBalance,
    monthlyTrend,
  });
}
