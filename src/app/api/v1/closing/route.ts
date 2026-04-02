import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { fiscalYear, fiscalMonth, action } = await req.json();
  if (!fiscalYear || !fiscalMonth || !action) {
    return NextResponse.json({ error: "params required" }, { status: 400 });
  }

  if (action === "close") {
    const period = await prisma.closingPeriod.upsert({
      where: { fiscalYear_fiscalMonth: { fiscalYear, fiscalMonth } },
      update: { status: "CLOSED", closedAt: new Date() },
      create: { fiscalYear, fiscalMonth, status: "CLOSED", closedAt: new Date() },
    });
    return NextResponse.json(period);
  } else if (action === "reopen") {
    const period = await prisma.closingPeriod.upsert({
      where: { fiscalYear_fiscalMonth: { fiscalYear, fiscalMonth } },
      update: { status: "OPEN", reopenedAt: new Date() },
      create: { fiscalYear, fiscalMonth, status: "OPEN" },
    });
    return NextResponse.json(period);
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
