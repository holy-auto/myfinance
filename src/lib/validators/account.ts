import { z } from "zod";

export const accountCreateSchema = z.object({
  code: z
    .string()
    .min(1, "勘定科目コードは必須です")
    .max(10, "コードは10文字以内です")
    .regex(/^\d+$/, "コードは数字のみです"),
  name: z.string().min(1, "勘定科目名は必須です").max(100),
  nameEn: z.string().max(100).optional(),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  normalBalance: z.enum(["DEBIT", "CREDIT"]),
  category: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  isSummary: z.boolean().default(false),
  taxCategoryId: z.string().optional(),
  description: z.string().optional(),
});

export const accountUpdateSchema = accountCreateSchema.partial();

export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
