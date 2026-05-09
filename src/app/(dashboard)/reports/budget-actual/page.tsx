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
import { YearPicker } from "./picker";

export default async function BudgetActualPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ? parseInt(sp.year, 10) : now.getFullYear();

  const [budgets, lines] = await Promise.all([
    prisma.budgetPlan.findMany({
      where: { fiscalYear: year },
      include: { account: { select: { code: true, name: true, type: true } } },
    }),
    prisma.journalLine.findMany({
      where: {
        journalEntry: { fiscalYear: year, status: "APPROVED" },
        account: { type: { in: ["REVENUE", "EXPENSE"] } },
      },
      select: {
        debit: true,
        credit: true,
        accountId: true,
        account: { select: { type: true } },
        journalEntry: { select: { fiscalMonth: true } },
      },
    }),
  ]);

  type Cell = { budget: Decimal; actual: Decimal };
  type Row = { code: string; name: string; type: string; cells: Map<number, Cell> };

  const rowMap = new Map<string, Row>();
  for (const b of budgets) {
    const key = b.accountId;
    if (!rowMap.has(key)) {
      rowMap.set(key, {
        code: b.account.code,
        name: b.account.name,
        type: b.account.type,
        cells: new Map(),
      });
    }
    const row = rowMap.get(key)!;
    const cell = row.cells.get(b.fiscalMonth) ?? { budget: new Decimal(0), actual: new Decimal(0) };
    cell.budget = cell.budget.plus(new Decimal(b.amount.toString()));
    row.cells.set(b.fiscalMonth, cell);
  }

  for (const l of lines) {
    const accountId = l.accountId;
    if (!rowMap.has(accountId)) {
      const acc = budgets.find((b) => b.accountId === accountId)?.account;
      if (!acc) continue;
      rowMap.set(accountId, { code: acc.code, name: acc.name, type: l.account.type, cells: new Map() });
    }
    const row = rowMap.get(accountId)!;
    const cell = row.cells.get(l.journalEntry.fiscalMonth) ?? {
      budget: new Decimal(0),
      actual: new Decimal(0),
    };
    const debit = new Decimal(l.debit.toString());
    const credit = new Decimal(l.credit.toString());
    const v = l.account.type === "REVENUE" ? credit.minus(debit) : debit.minus(credit);
    cell.actual = cell.actual.plus(v);
    row.cells.set(l.journalEntry.fiscalMonth, cell);
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const rows = Array.from(rowMap.values()).sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">予実比較レポート（年度）</h1>
        <p className="text-sm text-muted-foreground">
          科目別 × 月別の予算と実績を年間で比較
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>対象年度</CardTitle>
        </CardHeader>
        <CardContent>
          <YearPicker year={year} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>予実推移（{rows.length}科目）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32 sticky left-0 bg-background z-10">科目</TableHead>
                  <TableHead className="w-16 text-center">区分</TableHead>
                  {months.map((m) => (
                    <TableHead key={m} className="text-right">
                      {m}月
                    </TableHead>
                  ))}
                  <TableHead className="text-right">年間予算</TableHead>
                  <TableHead className="text-right">年間実績</TableHead>
                  <TableHead className="text-right">達成率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} className="text-center text-muted-foreground py-8">
                      予算が登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const yearBudget = months.reduce(
                      (s, m) => s.plus(row.cells.get(m)?.budget ?? new Decimal(0)),
                      new Decimal(0)
                    );
                    const yearActual = months.reduce(
                      (s, m) => s.plus(row.cells.get(m)?.actual ?? new Decimal(0)),
                      new Decimal(0)
                    );
                    const ratio = yearBudget.equals(0)
                      ? 0
                      : yearActual.dividedBy(yearBudget).times(100).toNumber();
                    return (
                      <TableRow key={row.code}>
                        <TableCell className="font-mono text-xs sticky left-0 bg-background z-10">
                          {row.code} {row.name}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-xs">
                            {row.type === "REVENUE" ? "収益" : "費用"}
                          </Badge>
                        </TableCell>
                        {months.map((m) => {
                          const cell = row.cells.get(m);
                          if (!cell || (cell.budget.equals(0) && cell.actual.equals(0))) {
                            return (
                              <TableCell key={m} className="text-right text-xs text-muted-foreground">
                                -
                              </TableCell>
                            );
                          }
                          const diff = cell.actual.minus(cell.budget);
                          return (
                            <TableCell key={m} className="text-right text-xs font-mono">
                              <div className="text-foreground">{cell.actual.toNumber().toLocaleString()}</div>
                              <div className="text-[10px] text-muted-foreground">
                                予 {cell.budget.toNumber().toLocaleString()}
                              </div>
                              <div
                                className={`text-[10px] ${
                                  diff.gte(0) ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {diff.gte(0) ? "+" : ""}
                                {diff.toNumber().toLocaleString()}
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-mono text-sm">
                          {yen(yearBudget.toNumber())}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-bold">
                          {yen(yearActual.toNumber())}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {yearBudget.equals(0) ? "-" : pct(ratio)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
