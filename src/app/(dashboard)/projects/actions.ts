"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { projectCreateSchema } from "@/lib/validators/master";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

function parseInput(fd: FormData) {
  const raw = Object.fromEntries(fd.entries());
  return projectCreateSchema.parse({
    code: raw.code,
    name: raw.name,
    startDate: raw.startDate || null,
    endDate: raw.endDate || null,
    isActive: raw.isActive !== "false",
  });
}

export async function createProjectAction(fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseInput(fd);
  const created = await prisma.project.create({
    data: {
      code: data.code,
      name: data.name,
      startDate: data.startDate ?? undefined,
      endDate: data.endDate ?? undefined,
      isActive: data.isActive,
    },
  });
  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "Project",
    entityId: created.id,
    changes: data as unknown as Record<string, unknown>,
  });
  revalidatePath("/projects");
  return created;
}

export async function updateProjectAction(id: string, fd: FormData) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  const data = parseInput(fd);
  const updated = await prisma.project.update({
    where: { id },
    data: {
      code: data.code,
      name: data.name,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      isActive: data.isActive,
    },
  });
  await createAuditLog({
    userId: user.id,
    action: "UPDATE",
    entityType: "Project",
    entityId: id,
    changes: data as unknown as Record<string, unknown>,
  });
  revalidatePath("/projects");
  return updated;
}

export async function toggleProjectAction(id: string, isActive: boolean) {
  const user = await requirePermission(PERMISSIONS.MASTER_MANAGE);
  await prisma.project.update({ where: { id }, data: { isActive } });
  await createAuditLog({
    userId: user.id,
    action: isActive ? "ACTIVATE" : "DEACTIVATE",
    entityType: "Project",
    entityId: id,
  });
  revalidatePath("/projects");
}
