"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { departmentCreateSchema } from "@/lib/validators/master";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

function parseInput(fd: FormData) {
  const raw = Object.fromEntries(fd.entries());
  return departmentCreateSchema.parse({
    code: raw.code,
    name: raw.name,
    isActive: raw.isActive !== "false",
  });
}

export async function createDepartmentAction(fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseInput(fd);
  const created = await prisma.department.create({ data });
  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "Department",
    entityId: created.id,
    changes: data,
  });
  revalidatePath("/departments");
  return created;
}

export async function updateDepartmentAction(id: string, fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseInput(fd);
  const updated = await prisma.department.update({ where: { id }, data });
  await createAuditLog({
    userId: user.id,
    action: "UPDATE",
    entityType: "Department",
    entityId: id,
    changes: data,
  });
  revalidatePath("/departments");
  return updated;
}

export async function toggleDepartmentAction(id: string, isActive: boolean) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  await prisma.department.update({ where: { id }, data: { isActive } });
  await createAuditLog({
    userId: user.id,
    action: isActive ? "ACTIVATE" : "DEACTIVATE",
    entityType: "Department",
    entityId: id,
  });
  revalidatePath("/departments");
}
