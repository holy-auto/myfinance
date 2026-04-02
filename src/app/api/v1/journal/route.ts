import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const fy = now.getFullYear();
  const fm = now.getMonth() + 1;

  const [thisMonthCount, pendingCount, totalRevenue, totalExpense, monthlyData] = await Promise.all([
    prisma.journalEntry.count({ where: { fiscalYear: fy, fiscalMonth: fm } }),
    prisma.journalEntry.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.journalLine.aggregate({
      where: { journalEntry: { status: "APPROVED", fiscalYear: fy }, account: { type: "REVENUE" } },
      _sum: { credit: true, debit: true },
    }),
    prisma.journalLine.aggregate({
      where: { journalEntry: { status: "APPROVED", fiscalYear: fy }, account: { type: "EXPENSE" } },
      _sum: { debit: true, credit: true },
    }),
    // Monthly revenue/expense for chart
    Promise.all(Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      return Promise.all([
        prisma.journalLine.aggregate({
          where: { journalEntry: { status: "APPROVED", fiscalYear: y, fiscalMonth: m }, account: { type: "REVENUE" } },
          _sum: { credit: true, debit: true },
        }),
        prisma.journalLine.aggregate({
          where: { journalEntry: { status: "APPROVED", fiscalYear: y, fiscalMonth: m }, account: { type: "EXPENSE" } },
          _sum: { debit: true, credit: true },
        }),
      ]).then(([rev, exp]) => ({
        month: `${y}/${String(m).padStart(2,"0")}`,
        revenue: Number(rev._sum.credit || 0) - Number(rev._sum.debit || 0),
        expense: Number(exp._sum.debit || 0) - Number(exp._sum.credit || 0),
      }));
    })),
  ]);

  const revenue = Number(totalRevenue._sum.credit || 0) - Number(totalRevenue._sum.debit || 0);
  const expense = Number(totalExpense._sum.debit || 0) - Number(totalExpense._sum.credit || 0);

  return NextResponse.json({
    thisMonthCount,
    pendingCount,
    revenue,
    expense,
    profit: revenue - expense,
    monthlyData,
  });
}
