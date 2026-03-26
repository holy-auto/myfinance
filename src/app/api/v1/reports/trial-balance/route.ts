import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  await requirePermission(PERMISSIONS.REPORT_VIEW);

  const { searchParams } = request.nextUrl;
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  if (!fromDate || !toDate) {
    return NextResponse.json(
      { error: "fromDate and toDate are required" },
      { status: 400 }
    );
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  if (from > to) {
    return NextResponse.json(
      { error: "fromDate must be before toDate" },
      { status: 400 }
    );
  }

  // Get approved journal entries in date range
  const entries = await prisma.journalEntry.findMany({
    where: {
      entryDate: { gte: from, lte: to },
      status: "APPROVED",
    },
    select: { id: true },
  });

  if (entries.length === 0) {
    return NextResponse.json([]);
  }

  const entryIds = entries.map((e: { id: string }) => e.id);

  // Aggregate lines by account
  const lines = await prisma.journalLine.findMany({
    where: { journalEntryId: { in: entryIds } },
    include: { account: true },
  });

  const totals = new Map<
    string,
    {
      accountId: string;
      accountCode: string;
      accountName: string;
      debitTotal: number;
      creditTotal: number;
    }
  >();

  for (const line of lines) {
    const key = line.accountId;
    const existing = totals.get(key) ?? {
      accountId: line.accountId,
      accountCode: line.account.code,
      accountName: line.account.name,
      debitTotal: 0,
      creditTotal: 0,
    };
    existing.debitTotal += Number(line.debit);
    existing.creditTotal += Number(line.credit);
    totals.set(key, existing);
  }

  const report = Array.from(totals.values())
    .map((row) => ({
      ...row,
      debitTotal: Math.round(row.debitTotal * 100) / 100,
      creditTotal: Math.round(row.creditTotal * 100) / 100,
      balance:
        Math.round((row.debitTotal - row.creditTotal) * 100) / 100,
    }))
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  return NextResponse.json(report);
}
