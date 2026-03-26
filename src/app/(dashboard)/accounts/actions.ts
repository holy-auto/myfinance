"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { accountCreateSchema } from "@/lib/validators/account";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  return prisma.account.findMany({
    orderBy: { code: "asc" },
    include: { parent: true },
  });
}

export async function getAccountTree() {
  const accounts = await prisma.account.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });

  // Build tree structure
  const map = new Map<string | null, typeof accounts>();
  for (const account of accounts) {
    const parentId = account.parentId ?? null;
    if (!map.has(parentId)) map.set(parentId, []);
    map.get(parentId)!.push(account);
  }

  return { accounts, tree: map };
}

export async function createAccount(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.ACCOUNT_CREATE);

  const raw = Object.fromEntries(formData.entries());
  const data = accountCreateSchema.parse({
    ...raw,
    parentId: raw.parentId || null,
    isSummary: raw.isSummary === "true",
  });

  const account = await prisma.account.create({ data });

  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "Account",
    entityId: account.id,
    changes: data as unknown as Record<string, unknown>,
  });

  revalidatePath("/accounts");
  return account;
}

export async function updateAccount(id: string, formData: FormData) {
  const user = await requirePermission(PERMISSIONS.ACCOUNT_CREATE);

  const raw = Object.fromEntries(formData.entries());
  const data = accountCreateSchema.parse({
    ...raw,
    parentId: raw.parentId || null,
    isSummary: raw.isSummary === "true",
  });

  const account = await prisma.account.update({
    where: { id },
    data,
  });

  await createAuditLog({
    userId: user.id,
    action: "UPDATE",
    entityType: "Account",
    entityId: account.id,
    changes: data as unknown as Record<string, unknown>,
  });

  revalidatePath("/accounts");
  return account;
}
