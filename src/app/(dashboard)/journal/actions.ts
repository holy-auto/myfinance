"use server";

import { requirePermission } from "@/lib/auth-helpers";
import { PERMISSIONS } from "@/lib/constants";
import { journalEntryCreateSchema } from "@/lib/validators/journal";
import {
  createJournalEntry,
  submitForApproval,
  approveEntry,
  rejectEntry,
} from "@/services/journal.service";
import { createAuditLog } from "@/services/audit.service";
import { revalidatePath } from "next/cache";

export async function createJournalAction(data: unknown) {
  const user = await requirePermission(PERMISSIONS.JOURNAL_CREATE);
  const input = journalEntryCreateSchema.parse(data);

  const entry = await createJournalEntry(input, user.id);

  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entityType: "JournalEntry",
    entityId: entry.id,
  });

  revalidatePath("/journal");
  return entry;
}

export async function submitJournalAction(entryId: string) {
  const user = await requirePermission(PERMISSIONS.JOURNAL_CREATE);

  const entry = await submitForApproval(entryId);

  await createAuditLog({
    userId: user.id,
    action: "SUBMIT",
    entityType: "JournalEntry",
    entityId: entry.id,
  });

  revalidatePath("/journal");
  return entry;
}

export async function approveJournalAction(entryId: string) {
  const user = await requirePermission(PERMISSIONS.JOURNAL_APPROVE);

  const entry = await approveEntry(entryId, user.id);

  await createAuditLog({
    userId: user.id,
    action: "APPROVE",
    entityType: "JournalEntry",
    entityId: entry.id,
  });

  revalidatePath("/journal");
  return entry;
}

export async function rejectJournalAction(entryId: string, reason: string) {
  const user = await requirePermission(PERMISSIONS.JOURNAL_APPROVE);

  const entry = await rejectEntry(entryId, user.id, reason);

  await createAuditLog({
    userId: user.id,
    action: "REJECT",
    entityType: "JournalEntry",
    entityId: entry.id,
    changes: { reason },
  });

  revalidatePath("/journal");
  return entry;
}
