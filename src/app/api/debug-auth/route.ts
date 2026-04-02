import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@myfinance.local" },
      select: {
        id: true,
        email: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    return NextResponse.json({
      found: true,
      email: user.email,
      isActive: user.isActive,
      hashPrefix: user.passwordHash?.slice(0, 10),
      hashLength: user.passwordHash?.length,
    });
  } catch (e: unknown) {
    return NextResponse.json({
      error: String(e),
      dbUrl: process.env.DATABASE_URL?.slice(0, 30) + "...",
    }, { status: 500 });
  }
}
