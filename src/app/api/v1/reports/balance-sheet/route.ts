import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const asOfDate = searchParams.get("asOfDate");
  if (!asOfDate) return NextResponse.json({ error: "asOfDate required" }, { status: 400 });

  const lines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        entryDate: { lte: new Date(asOfDate + "T23:59:59") },
        status: "APPROVED",
      },
      account: { type: { in: ["ASSET", "LIABILITY", "EQUITY"] } },
    },
    include: { account: { select: { id: true, code: true, name: true, type: true, normalBalance: true } } },
  });

  const map: Record<string, { id: string; code: string; name: string; type: string; normalBalance: string; debit: number; credit: number }> = {};
  for (const line of lines) {
    const key = line.accountId;
    if (!map[key]) map[key] = { id: line.account.id, code: line.account.code, name: line.account.name, type: line.account.type, normalBalance: line.account.normalBalance, debit: 0, credit: 0 };
    map[key].debit += Number(line.debit);
    map[key].credit += Number(line.credit);
  }

  const items = Object.values(map).map((r) => ({
    ...r,
    balance: r.normalBalance === "DEBIT" ? r.debit - r.credit : r.credit - r.debit,
  })).sort((a, b) => a.code.localeCompare(b.code));

  const assets = items.filter((i) => i.type === "ASSET");
  const liabilities = items.filter((i) => i.type === "LIABILITY");
  const equity = items.filter((i) => i.type === "EQUITY");

  return NextResponse.json({
    assets,
    liabilities,
    equity,
    totalAssets: assets.reduce((s, i) => s + i.balance, 0),
    totalLiabilities: liabilities.reduce((s, i) => s + i.balance, 0),
    totalEquity: equity.reduce((s, i) => s + i.balance, 0),
  });
}
