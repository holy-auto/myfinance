"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { budgetPlanCreateSchema } from "@/lib/validators/master";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

function parseInput(fd: FormData) {
  const raw = Object.fromEntries(fd.entries());
  const cleaned: Record<string, unknown> = { ...raw };
  for (const k of Object.keys(cleaned)) {
    if (cleaned[k] === "") cleaned[k] = null;
  }
  return budgetPlanCreateSchema.parse(cleaned);
}

export async function createBudgetAction(fd: FormData) {
  const user = await requirePermission(PERMISSIONS.BUDGET_MANAGE);
  const data = parseInput(fd);
  const created = await prisma.budgetPlan.upsert({
    where: {
      fiscalYear_fiscalMonth_accountId_businessUnitId: {
        fiscalYear: data.fiscalYear,
        fiscalMonth: data.fiscalMonth,
        accountId: data.accountId,
        businessUnitId: data.businessUnitId ?? "",
      },
    },
    update: {
      amount: data.amount,
      description: data.description ?? null,
    },
    create: {
      fiscalYear: data.fiscalYear,
      fiscalMonth: data.fiscalMonth,
      accountId: data.accountId,
      businessUnitId: data.businessUnitId ?? null,
      amount: data.amount,
      description: data.description ?? null,
    },
  });
  await createAuditLog({
    userId: user.id,
    action: "UPSERT",
    entityType: "BudgetPlan",
    entityId: created.id,
    changes: data as unknown as Record<string, unknown>,
  });
  revalidatePath("/budget");
  return created;
}

export async function deleteBudgetAction(id: string) {
  const user = await requirePermission(PERMISSIONS.BUDGET_MANAGE);
  await prisma.budgetPlan.delete({ where: { id } });
  await createAuditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "BudgetPlan",
    entityId: id,
  });
  revalidatePath("/budget");
}

export async function copyPreviousMonthAction(fiscalYear: number, fiscalMonth: number) {
  const user = await requirePermission(PERMISSIONS.BUDGET_MANAGE);
  const prevDate = new Date(fiscalYear, fiscalMonth - 2, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1;

  const prev = await prisma.budgetPlan.findMany({
    where: { fiscalYear: prevYear, fiscalMonth: prevMonth },
  });

  let copied = 0;
  for (const p of prev) {
    await prisma.budgetPlan.upsert({
      where: {
        fiscalYear_fiscalMonth_accountId_businessUnitId: {
          fiscalYear,
          fiscalMonth,
          accountId: p.accountId,
          businessUnitId: p.businessUnitId ?? "",
        },
      },
      update: {},
      create: {
        fiscalYear,
        fiscalMonth,
        accountId: p.accountId,
        businessUnitId: p.businessUnitId,
        amount: p.amount,
        description: p.description,
      },
    });
    copied++;
  }

  await createAuditLog({
    userId: user.id,
    action: "COPY",
    entityType: "BudgetPlan",
    entityId: `${fiscalYear}-${fiscalMonth}`,
    changes: { from: `${prevYear}-${prevMonth}`, to: `${fiscalYear}-${fiscalMonth}`, copied },
  });

  revalidatePath("/budget");
  return { copied };
}
