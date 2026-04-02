import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  if (!fromDate || !toDate) {
    return NextResponse.json({ error: "fromDate and toDate are required" }, { status: 400 });
  }

  const lines = await prisma.journalLine.findMany({
    where: {
      journalEntry: {
        entryDate: { gte: new Date(fromDate), lte: new Date(toDate + "T23:59:59") },
        status: "APPROVED",
      },
    },
    include: { account: { select: { id: true, code: true, name: true, type: true, normalBalance: true } } },
  });

  const map: Record<string, { accountId: string; accountCode: string; accountName: string; accountType: string; normalBalance: string; debitTotal: number; creditTotal: number }> = {};
  for (const line of lines) {
    const key = line.accountId;
    if (!map[key]) {
      map[key] = {
        accountId: line.account.id,
        accountCode: line.account.code,
        accountName: line.account.name,
        accountType: line.account.type,
        normalBalance: line.account.normalBalance,
        debitTotal: 0,
        creditTotal: 0,
      };
    }
    map[key].debitTotal += Number(line.debit);
    map[key].creditTotal += Number(line.credit);
  }

  const rows = Object.values(map)
    .map((r) => ({
      ...r,
      balance: r.normalBalance === "DEBIT" ? r.debitTotal - r.creditTotal : r.creditTotal - r.debitTotal,
    }))
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  return NextResponse.json(rows);
}
