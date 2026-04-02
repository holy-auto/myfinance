import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  if (!fromDate || !toDate) return NextResponse.json({ error: "params required" }, { status: 400 });

  const lines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        entryDate: { gte: new Date(fromDate), lte: new Date(toDate + "T23:59:59") },
        status: "APPROVED",
      },
      account: { type: { in: ["REVENUE", "EXPENSE"] } },
    },
    include: { account: { select: { code: true, name: true, type: true, normalBalance: true } } },
  });

  const map: Record<string, { code: string; name: string; type: string; normalBalance: string; debit: number; credit: number }> = {};
  for (const line of lines) {
    const key = line.accountId;
    if (!map[key]) map[key] = { code: line.account.code, name: line.account.name, type: line.account.type, normalBalance: line.account.normalBalance, debit: 0, credit: 0 };
    map[key].debit += Number(line.debit);
    map[key].credit += Number(line.credit);
  }

  const items = Object.values(map).map((r) => ({
    ...r,
    balance: r.normalBalance === "DEBIT" ? r.debit - r.credit : r.credit - r.debit,
  })).sort((a, b) => a.code.localeCompare(b.code));

  const revenue = items.filter((i) => i.type === "REVENUE");
  const expense = items.filter((i) => i.type === "EXPENSE");
  const totalRevenue = revenue.reduce((s, i) => s + i.balance, 0);
  const totalExpense = expense.reduce((s, i) => s + i.balance, 0);
  const costOfSales = expense.filter((i) => i.code.startsWith("5")).reduce((s, i) => s + i.balance, 0);
  const sgaExpense = expense.filter((i) => i.code.startsWith("6")).reduce((s, i) => s + i.balance, 0);
  const otherExpense = expense.filter((i) => i.code.startsWith("7")).reduce((s, i) => s + i.balance, 0);

  return NextResponse.json({
    revenue,
    expense,
    totalRevenue,
    totalExpense,
    grossProfit: totalRevenue - costOfSales,
    operatingProfit: totalRevenue - costOfSales - sgaExpense,
    ordinaryProfit: totalRevenue - costOfSales - sgaExpense - otherExpense,
    netProfit: totalRevenue - totalExpense,
    costOfSales,
    sgaExpense,
    otherExpense,
  });
}
