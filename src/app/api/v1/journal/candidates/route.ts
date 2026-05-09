import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amountStr = searchParams.get("amount");
  const dateStr = searchParams.get("date");
  if (!amountStr || !dateStr) {
    return NextResponse.json([], { status: 200 });
  }
  const amount = new Decimal(amountStr);
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return NextResponse.json([]);

  const start = new Date(target);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  const end = new Date(target);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  const entries = await prisma.journalEntry.findMany({
    where: {
      entryDate: { gte: start, lte: end },
      bankTransactions: { none: {} },
    },
    include: { lines: true },
    take: 50,
    orderBy: { entryDate: "desc" },
  });

  const result = entries
    .map((e) => {
      const total = e.lines.reduce(
        (s, l) => s.plus(new Decimal(l.debit.toString())),
        new Decimal(0)
      );
      return {
        id: e.id,
        entryNumber: e.entryNumber,
        description: e.description,
        entryDate: e.entryDate.toISOString(),
        totalAmount: total.toNumber(),
        diff: total.minus(amount).abs().toNumber(),
      };
    })
    .filter((e) => e.diff <= amount.toNumber() * 0.05 || e.diff < 100)
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 20);

  return NextResponse.json(result);
}
