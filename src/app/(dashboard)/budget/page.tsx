export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { yen, pct } from "@/lib/format";
import { BudgetForm } from "./budget-form";
import { PeriodPicker } from "./period-picker";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const fiscalYear = sp.year ? parseInt(sp.year, 10) : now.getFullYear();
  const fiscalMonth = sp.month ? parseInt(sp.month, 10) : now.getMonth() + 1;

  const [budgets, allLines, accounts, businessUnits] = await Promise.all([
    prisma.budgetPlan.findMany({
      where: { fiscalYear, fiscalMonth },
      include: {
        account: { select: { code: true, name: true, type: true } },
        businessUnit: { select: { name: true } },
      },
      orderBy: { account: { code: "asc" } },
    }),
    prisma.journalLine.findMany({
      where: {
        journalEntry: {
          fiscalYear,
          fiscalMonth,
          status: { in: ["APPROVED", "PENDING_APPROVAL"] },
        },
      },
      select: {
        accountId: true,
        debit: true,
        credit: true,
        businessUnitId: true,
        account: { select: { type: true } },
      },
    }),
    prisma.account.findMany({
      where: { isActive: true, isSummary: false, type: { in: ["REVENUE", "EXPENSE"] } },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.businessUnit.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const actualMap = new Map<string, Decimal>();
  for (const l of allLines) {
    const key = `${l.accountId}::${l.businessUnitId ?? ""}`;
    const debit = new Decimal(l.debit.toString());
    const credit = new Decimal(l.credit.toString());
    const v = l.account.type === "REVENUE" ? credit.minus(debit) : debit.minus(credit);
    actualMap.set(key, (actualMap.get(key) ?? new Decimal(0)).plus(v));
  }

  let budgetSum = new Decimal(0);
  let actualSum = new Decimal(0);
  const rows = budgets.map((b) => {
    const key = `${b.accountId}::${b.businessUnitId ?? ""}`;
    const actual = actualMap.get(key) ?? new Decimal(0);
    const budget = new Decimal(b.amount.toString());
    budgetSum = budgetSum.plus(budget);
    actualSum = actualSum.plus(actual);
    const diff = actual.minus(budget).toNumber();
    const ratio = budget.equals(0) ? 0 : actual.dividedBy(budget).times(100).toNumber();
    return {
      id: b.id,
      account: b.account,
      businessUnit: b.businessUnit?.name ?? "全社",
      budget: budget.toNumber(),
      actual: actual.toNumber(),
      diff,
      ratio,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">予算管理 / 予実比較</h1>
          <p className="text-sm text-muted-foreground">
            勘定科目 × 事業区分 単位の予算編成と実績対比
          </p>
        </div>
        <BudgetForm
          accounts={accounts}
          businessUnits={businessUnits}
          fiscalYear={fiscalYear}
          fiscalMonth={fiscalMonth}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>対象期間</CardTitle>
        </CardHeader>
        <CardContent>
          <PeriodPicker year={fiscalYear} month={fiscalMonth} />
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">予算合計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yen(budgetSum.toNumber())}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">実績合計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yen(actualSum.toNumber())}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">差異</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                actualSum.minus(budgetSum).gte(0) ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {yen(actualSum.minus(budgetSum).toNumber())}
            </div>
            <p className="text-xs text-muted-foreground">
              達成率: {budgetSum.equals(0) ? "-" : pct(actualSum.dividedBy(budgetSum).times(100).toNumber())}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            予実明細（{fiscalYear}年{fiscalMonth}月 / {rows.length}件）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">コード</TableHead>
                  <TableHead>科目</TableHead>
                  <TableHead className="w-32">事業区分</TableHead>
                  <TableHead className="w-32 text-right">予算</TableHead>
                  <TableHead className="w-32 text-right">実績</TableHead>
                  <TableHead className="w-32 text-right">差異</TableHead>
                  <TableHead className="w-24 text-right">達成率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      この期間の予算は未登録です
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.account.code}</TableCell>
                      <TableCell>
                        {r.account.name}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {r.account.type === "REVENUE" ? "収益" : "費用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{r.businessUnit}</TableCell>
                      <TableCell className="text-right font-mono">{yen(r.budget)}</TableCell>
                      <TableCell className="text-right font-mono">{yen(r.actual)}</TableCell>
                      <TableCell
                        className={`text-right font-mono ${r.diff >= 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {yen(r.diff)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {r.budget === 0 ? "-" : pct(r.ratio)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
