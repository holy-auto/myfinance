import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const accountId = searchParams.get("accountId");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  if (!accountId || !fromDate || !toDate) return NextResponse.json({ error: "params required" }, { status: 400 });

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ error: "account not found" }, { status: 404 });

  const lines = await prisma.journalLine.findMany({
    where: {
      accountId,
      journalEntry: {
        entryDate: { gte: new Date(fromDate), lte: new Date(toDate + "T23:59:59") },
        status: "APPROVED",
      },
    },
    include: { journalEntry: { select: { entryNumber: true, entryDate: true, description: true } } },
    orderBy: [{ journalEntry: { entryDate: "asc" } }, { lineOrder: "asc" }],
  });

  let runningBalance = 0;
  const rows = lines.map((line) => {
    const debit = Number(line.debit);
    const credit = Number(line.credit);
    runningBalance += account.normalBalance === "DEBIT" ? debit - credit : credit - debit;
    return {
      entryNumber: line.journalEntry.entryNumber,
      entryDate: line.journalEntry.entryDate,
      description: line.description ?? line.journalEntry.description,
      debit,
      credit,
      balance: runningBalance,
    };
  });

  return NextResponse.json({ account, rows });
}
