import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const accounts = await prisma.account.findMany({
    where: { isActive: true, isSummary: false },
    orderBy: { code: "asc" },
    select: { id: true, code: true, name: true, type: true, normalBalance: true },
  });
  return NextResponse.json(accounts);
}
