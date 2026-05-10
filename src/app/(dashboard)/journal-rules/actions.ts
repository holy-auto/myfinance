"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { journalRuleCreateSchema } from "@/lib/validators/master";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

function parseInput(fd: FormData) {
  const raw = Object.fromEntries(fd.entries());
  const cleaned: Record<string, unknown> = { ...raw };
  for (const k of Object.keys(cleaned)) {
    if (cleaned[k] === "") cleaned[k] = null;
  }
  cleaned.isActive = raw.isActive !== "false";
  cleaned.priority = raw.priority ? Number(raw.priority) : 100;
  return journalRuleCreateSchema.parse(cleaned);
}

export async function createRuleAction(fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseInput(fd);
  const created = await prisma.journalRule.create({
    data: {
      name: data.name,
      priority: data.priority,
      isActive: data.isActive,
      matchKeyword: data.matchKeyword ?? undefined,
      matchAmountMin: data.matchAmountMin ?? undefined,
      matchAmountMax: data.matchAmountMax ?? undefined,
      counterpartyId: data.counterpartyId ?? undefined,
      debitAccountId: data.debitAccountId ?? undefined,
      creditAccountId: data.creditAccountId ?? undefined,
      taxCategory: data.taxCategory ?? undefined,
      businessUnitId: data.businessUnitId ?? undefined,
      projectId: data.projectId ?? undefined,
      description: data.description ?? undefined,
    },
  });
  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "JournalRule",
    entityId: created.id,
    changes: data as unknown as Record<string, unknown>,
  });
  revalidatePath("/journal-rules");
  return created;
}

export async function updateRuleAction(id: string, fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseInput(fd);
  const updated = await prisma.journalRule.update({
    where: { id },
    data: {
      name: data.name,
      priority: data.priority,
      isActive: data.isActive,
      matchKeyword: data.matchKeyword ?? null,
      matchAmountMin: data.matchAmountMin ?? null,
      matchAmountMax: data.matchAmountMax ?? null,
      counterpartyId: data.counterpartyId ?? null,
      debitAccountId: data.debitAccountId ?? null,
      creditAccountId: data.creditAccountId ?? null,
      taxCategory: data.taxCategory ?? null,
      businessUnitId: data.businessUnitId ?? null,
      projectId: data.projectId ?? null,
      description: data.description ?? null,
    },
  });
  await createAuditLog({
    userId: user.id,
    action: "UPDATE",
    entityType: "JournalRule",
    entityId: id,
    changes: data as unknown as Record<string, unknown>,
  });
  revalidatePath("/journal-rules");
  return updated;
}

export async function deleteRuleAction(id: string) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  await prisma.journalRule.delete({ where: { id } });
  await createAuditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "JournalRule",
    entityId: id,
  });
  revalidatePath("/journal-rules");
}
