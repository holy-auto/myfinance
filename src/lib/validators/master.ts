import { z } from "zod";

export const counterpartyCreateSchema = z.object({
  code: z.string().min(1, "コードは必須です").max(20),
  name: z.string().min(1, "取引先名は必須です").max(200),
  nameKana: z.string().max(200).optional().nullable(),
  kind: z.enum(["CUSTOMER", "VENDOR", "BOTH", "OTHER"]).default("BOTH"),
  registrationNo: z.string().max(20).optional().nullable(),
  email: z.string().email("メールアドレスの形式が不正です").optional().or(z.literal("")).nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  bankInfo: z.string().max(500).optional().nullable(),
  paymentTerms: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CounterpartyCreateInput = z.infer<typeof counterpartyCreateSchema>;

export const departmentCreateSchema = z.object({
  code: z.string().min(1, "コードは必須です").max(20),
  name: z.string().min(1, "部門名は必須です").max(100),
  isActive: z.boolean().default(true),
});

export const businessUnitCreateSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  isActive: z.boolean().default(true),
});

export const projectCreateSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const journalRuleCreateSchema = z.object({
  name: z.string().min(1, "ルール名は必須です").max(200),
  priority: z.coerce.number().int().min(1).max(9999).default(100),
  isActive: z.boolean().default(true),
  matchKeyword: z.string().max(200).optional().nullable(),
  matchAmountMin: z.coerce.number().optional().nullable(),
  matchAmountMax: z.coerce.number().optional().nullable(),
  counterpartyId: z.string().uuid().optional().nullable(),
  debitAccountId: z.string().uuid().optional().nullable(),
  creditAccountId: z.string().uuid().optional().nullable(),
  taxCategory: z.string().max(50).optional().nullable(),
  businessUnitId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export const bankAccountCreateSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  type: z.enum(["CHECKING", "SAVINGS", "CREDIT_CARD", "E_MONEY", "CASH"]),
  bankName: z.string().max(200).optional().nullable(),
  branchName: z.string().max(200).optional().nullable(),
  accountNumber: z.string().max(50).optional().nullable(),
  linkedAccountId: z.string().uuid().optional().nullable(),
  openingBalance: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const budgetPlanCreateSchema = z.object({
  fiscalYear: z.coerce.number().int().min(2000).max(2100),
  fiscalMonth: z.coerce.number().int().min(1).max(12),
  accountId: z.string().uuid(),
  businessUnitId: z.string().uuid().optional().nullable(),
  amount: z.coerce.number(),
  description: z.string().max(500).optional().nullable(),
});
