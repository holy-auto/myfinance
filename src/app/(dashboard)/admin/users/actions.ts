"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

export async function inviteUserAction(fd: FormData) {
  const me = await requirePermission(PERMISSIONS.ADMIN_MANAGE);
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const name = String(fd.get("name") ?? "").trim();
  const password = String(fd.get("password") ?? "").trim();
  const roleId = String(fd.get("roleId") ?? "").trim();

  if (!email || !name) throw new Error("メールと名前は必須です");
  if (password.length < 8) throw new Error("初期パスワードは8文字以上で設定してください");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, isActive: true },
  });

  if (roleId) {
    await prisma.userRole.create({
      data: { userId: user.id, roleId, assignedById: me.id },
    });
  }

  await createAuditLog({
    userId: me.id,
    action: "INVITE",
    entityType: "User",
    entityId: user.id,
    changes: { email, name, roleId },
  });

  revalidatePath("/admin/users");
  return user;
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const me = await requirePermission(PERMISSIONS.ADMIN_MANAGE);
  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  await createAuditLog({
    userId: me.id,
    action: isActive ? "ACTIVATE" : "DEACTIVATE",
    entityType: "User",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}

export async function assignRoleAction(userId: string, roleId: string) {
  const me = await requirePermission(PERMISSIONS.ADMIN_MANAGE);
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId, assignedById: me.id },
  });
  await createAuditLog({
    userId: me.id,
    action: "ASSIGN_ROLE",
    entityType: "User",
    entityId: userId,
    changes: { roleId },
  });
  revalidatePath("/admin/users");
}

export async function removeRoleAction(userId: string, roleId: string) {
  const me = await requirePermission(PERMISSIONS.ADMIN_MANAGE);
  await prisma.userRole.delete({
    where: { userId_roleId: { userId, roleId } },
  });
  await createAuditLog({
    userId: me.id,
    action: "REMOVE_ROLE",
    entityType: "User",
    entityId: userId,
    changes: { roleId },
  });
  revalidatePath("/admin/users");
}

export async function resetPasswordAction(userId: string, newPassword: string) {
  const me = await requirePermission(PERMISSIONS.ADMIN_MANAGE);
  if (newPassword.length < 8) throw new Error("8文字以上で設定してください");
  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
  await createAuditLog({
    userId: me.id,
    action: "RESET_PASSWORD",
    entityType: "User",
    entityId: userId,
  });
  revalidatePath("/admin/users");
}
