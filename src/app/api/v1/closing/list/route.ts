import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const periods = await prisma.closingPeriod.findMany({
    orderBy: [{ fiscalYear: "desc" }, { fiscalMonth: "desc" }],
    include: { closedBy: { select: { name: true } } },
  });
  return NextResponse.json(periods);
}
