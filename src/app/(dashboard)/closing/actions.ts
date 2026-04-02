"use server";

import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function closePeriodAction(fiscalYear: number, fiscalMonth: number) {
  const user = await requirePermission(PERMISSIONS.CLOSING_MANAGE);

  const period = await prisma.closingPeriod.upsert({
    where: { fiscalYear_fiscalMonth: { fiscalYear, fiscalMonth } },
    update: {
      status: "CLOSED",
      closedAt: new Date(),
      closedById: user.id,
    },
    create: {
      fiscalYear,
      fiscalMonth,
      status: "CLOSED",
      closedAt: new Date(),
      closedById: user.id,
    },
  });

  revalidatePath("/closing");
  return period;
}

export async function reopenPeriodAction(fiscalYear: number, fiscalMonth: number) {
  const user = await requirePermission(PERMISSIONS.CLOSING_MANAGE);

  const period = await prisma.closingPeriod.update({
    where: { fiscalYear_fiscalMonth: { fiscalYear, fiscalMonth } },
    data: {
      status: "OPEN",
      closedAt: null,
      closedById: null,
    },
  });

  revalidatePath("/closing");
  return period;
}
