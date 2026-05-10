"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { counterpartyCreateSchema } from "@/lib/validators/master";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

function parseFormData(fd: FormData) {
  const raw = Object.fromEntries(fd.entries());
  const cleaned: Record<string, unknown> = { ...raw };
  for (const k of Object.keys(cleaned)) {
    if (cleaned[k] === "") cleaned[k] = null;
  }
  cleaned.isActive = raw.isActive === "true" || raw.isActive === "on";
  return counterpartyCreateSchema.parse(cleaned);
}

export async function createCounterpartyAction(fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseFormData(fd);
  const created = await prisma.counterparty.create({
    data: {
      ...data,
      email: data.email || undefined,
    },
  });
  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "Counterparty",
    entityId: created.id,
    changes: data as unknown as Record<string, unknown>,
  });
  revalidatePath("/counterparties");
  return created;
}

export async function updateCounterpartyAction(id: string, fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseFormData(fd);
  const updated = await prisma.counterparty.update({
    where: { id },
    data: {
      ...data,
      email: data.email || null,
    },
  });
  await createAuditLog({
    userId: user.id,
    action: "UPDATE",
    entityType: "Counterparty",
    entityId: id,
    changes: data as unknown as Record<string, unknown>,
  });
  revalidatePath("/counterparties");
  return updated;
}

export async function toggleCounterpartyActiveAction(id: string, isActive: boolean) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  await prisma.counterparty.update({ where: { id }, data: { isActive } });
  await createAuditLog({
    userId: user.id,
    action: isActive ? "ACTIVATE" : "DEACTIVATE",
    entityType: "Counterparty",
    entityId: id,
  });
  revalidatePath("/counterparties");
}
