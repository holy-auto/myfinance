import { z } from "zod";

const journalLineSchema = z
  .object({
    accountId: z.string().uuid("無効な勘定科目IDです"),
    debit: z.coerce.number().min(0, "借方は0以上です").default(0),
    credit: z.coerce.number().min(0, "貸方は0以上です").default(0),
    description: z.string().optional(),
    taxCategory: z.string().optional(),
    departmentId: z.string().uuid().optional().nullable(),
    businessUnitId: z.string().uuid().optional().nullable(),
    projectId: z.string().uuid().optional().nullable(),
  })
  .refine((line) => line.debit > 0 || line.credit > 0, {
    message: "借方または貸方のいずれかは0より大きい必要があります",
  })
  .refine((line) => !(line.debit > 0 && line.credit > 0), {
    message: "借方と貸方の両方に金額を入力することはできません",
  });

export const journalEntryCreateSchema = z
  .object({
    entryDate: z.coerce.date(),
    description: z.string().min(1, "摘要は必須です"),
    businessUnitId: z.string().uuid().optional().nullable(),
    projectId: z.string().uuid().optional().nullable(),
    lines: z.array(journalLineSchema).min(2, "最低2行の仕訳明細が必要です"),
  })
  .refine(
    (data) => {
      const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0);
      return Math.abs(totalDebit - totalCredit) < 0.01;
    },
    { message: "借方合計と貸方合計が一致しません" }
  );

export type JournalEntryCreateInput = z.infer<typeof journalEntryCreateSchema>;
export type JournalLineInput = z.infer<typeof journalLineSchema>;
