"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

export async function registerAttachmentAction(fd: FormData) {
  const user = await requirePermission(PERMISSIONS.DOCUMENT_UPLOAD);
  const fileName = String(fd.get("fileName") ?? "").trim();
  const mimeType = String(fd.get("mimeType") ?? "application/octet-stream");
  const fileSize = Number(fd.get("fileSize") ?? 0);
  const storageKey = String(fd.get("storageKey") ?? "").trim() || `local/${Date.now()}-${fileName}`;
  const storageUrl = String(fd.get("storageUrl") ?? "").trim() || null;
  const journalEntryId = String(fd.get("journalEntryId") ?? "").trim() || null;

  if (!fileName) throw new Error("ファイル名は必須です");
  if (fileSize <= 0) throw new Error("ファイルサイズが不正です");

  const att = await prisma.attachment.create({
    data: {
      fileName,
      mimeType,
      fileSize,
      storageKey,
      storageUrl,
      uploadedById: user.id,
      ocrStatus: "PENDING",
    },
  });

  if (journalEntryId) {
    await prisma.entryAttachment.create({
      data: { journalEntryId, attachmentId: att.id },
    });
  }

  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "Attachment",
    entityId: att.id,
    changes: { fileName, journalEntryId },
  });

  revalidatePath("/attachments");
  return att;
}

export async function attachToEntryAction(attachmentId: string, journalEntryId: string) {
  const user = await requirePermission(PERMISSIONS.DOCUMENT_UPLOAD);
  await prisma.entryAttachment.upsert({
    where: { journalEntryId_attachmentId: { journalEntryId, attachmentId } },
    update: {},
    create: { journalEntryId, attachmentId },
  });
  await createAuditLog({
    userId: user.id,
    action: "ATTACH",
    entityType: "Attachment",
    entityId: attachmentId,
    changes: { journalEntryId },
  });
  revalidatePath("/attachments");
}

export async function deleteAttachmentAction(id: string) {
  const user = await requirePermission(PERMISSIONS.DOCUMENT_UPLOAD);
  await prisma.entryAttachment.deleteMany({ where: { attachmentId: id } });
  await prisma.attachment.delete({ where: { id } });
  await createAuditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "Attachment",
    entityId: id,
  });
  revalidatePath("/attachments");
}

export async function simulateOcrAction(id: string) {
  const user = await requirePermission(PERMISSIONS.DOCUMENT_UPLOAD);
  await prisma.attachment.update({
    where: { id },
    data: {
      ocrStatus: "COMPLETED",
      ocrData: JSON.stringify({
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        vendor: "（要修正）",
        confidence: 0.5,
        note: "OCRエンジンの代替: 手動で確認・修正してください",
      }),
    },
  });
  await createAuditLog({
    userId: user.id,
    action: "OCR_SIMULATE",
    entityType: "Attachment",
    entityId: id,
  });
  revalidatePath("/attachments");
}
