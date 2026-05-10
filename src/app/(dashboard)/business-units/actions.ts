"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { businessUnitCreateSchema } from "@/lib/validators/master";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

function parseInput(fd: FormData) {
  const raw = Object.fromEntries(fd.entries());
  return businessUnitCreateSchema.parse({
    code: raw.code,
    name: raw.name,
    isActive: raw.isActive !== "false",
  });
}

export async function createBusinessUnitAction(fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseInput(fd);
  const created = await prisma.businessUnit.create({ data });
  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "BusinessUnit",
    entityId: created.id,
    changes: data,
  });
  revalidatePath("/business-units");
  return created;
}

export async function updateBusinessUnitAction(id: string, fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseInput(fd);
  const updated = await prisma.businessUnit.update({ where: { id }, data });
  await createAuditLog({
    userId: user.id,
    action: "UPDATE",
    entityType: "BusinessUnit",
    entityId: id,
    changes: data,
  });
  revalidatePath("/business-units");
  return updated;
}

export async function toggleBusinessUnitAction(id: string, isActive: boolean) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  await prisma.businessUnit.update({ where: { id }, data: { isActive } });
  await createAuditLog({
    userId: user.id,
    action: isActive ? "ACTIVATE" : "DEACTIVATE",
    entityType: "BusinessUnit",
    entityId: id,
  });
  revalidatePath("/business-units");
}
