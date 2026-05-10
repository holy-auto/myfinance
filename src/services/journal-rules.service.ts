import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";

export type RuleMatchInput = {
  description: string;
  amount: number;
  counterpartyName?: string;
};

export type RuleMatchResult = {
  ruleId: string;
  ruleName: string;
  debitAccountId?: string | null;
  debitAccountCode?: string;
  debitAccountName?: string;
  creditAccountId?: string | null;
  creditAccountCode?: string;
  creditAccountName?: string;
  counterpartyId?: string | null;
  taxCategory?: string | null;
  businessUnitId?: string | null;
  projectId?: string | null;
  confidence: number;
};

export async function findMatchingRule(
  input: RuleMatchInput
): Promise<RuleMatchResult | null> {
  const rules = await prisma.journalRule.findMany({
    where: { isActive: true },
    orderBy: { priority: "asc" },
    include: {
      counterparty: { select: { id: true, name: true } },
    },
  });

  let counterpartyId: string | null = null;
  if (input.counterpartyName) {
    const cp = await prisma.counterparty.findFirst({
      where: { name: input.counterpartyName },
    });
    counterpartyId = cp?.id ?? null;
  }

  const candidates: { rule: typeof rules[number]; score: number }[] = [];
  const keyword = input.description.toLowerCase();
  const amount = new Decimal(input.amount);

  for (const r of rules) {
    let score = 0;
    let matched = false;

    if (r.matchKeyword) {
      const kw = r.matchKeyword.toLowerCase();
      if (keyword.includes(kw)) {
        score += 60;
        matched = true;
      } else continue;
    }

    if (r.counterpartyId && counterpartyId) {
      if (r.counterpartyId === counterpartyId) {
        score += 30;
        matched = true;
      } else continue;
    }

    if (r.matchAmountMin) {
      if (amount.lt(new Decimal(r.matchAmountMin.toString()))) continue;
      score += 5;
    }
    if (r.matchAmountMax) {
      if (amount.gt(new Decimal(r.matchAmountMax.toString()))) continue;
      score += 5;
    }

    if (matched) candidates.push({ rule: r, score });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  const accountIds = [best.rule.debitAccountId, best.rule.creditAccountId].filter(
    (v): v is string => !!v
  );
  const accounts = accountIds.length
    ? await prisma.account.findMany({ where: { id: { in: accountIds } } })
    : [];
  const aMap = new Map(accounts.map((a) => [a.id, a]));

  await prisma.journalRule.update({
    where: { id: best.rule.id },
    data: { hitCount: { increment: 1 }, lastHitAt: new Date() },
  });

  const debit = best.rule.debitAccountId ? aMap.get(best.rule.debitAccountId) : null;
  const credit = best.rule.creditAccountId ? aMap.get(best.rule.creditAccountId) : null;

  return {
    ruleId: best.rule.id,
    ruleName: best.rule.name,
    debitAccountId: best.rule.debitAccountId,
    debitAccountCode: debit?.code,
    debitAccountName: debit?.name,
    creditAccountId: best.rule.creditAccountId,
    creditAccountCode: credit?.code,
    creditAccountName: credit?.name,
    counterpartyId: best.rule.counterpartyId,
    taxCategory: best.rule.taxCategory,
    businessUnitId: best.rule.businessUnitId,
    projectId: best.rule.projectId,
    confidence: Math.min(100, best.score) / 100,
  };
}
