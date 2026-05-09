export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { RuleForm } from "./rule-form";

export default async function JournalRulesPage() {
  const [rules, accounts, counterparties, businessUnits] = await Promise.all([
    prisma.journalRule.findMany({
      orderBy: [{ isActive: "desc" }, { priority: "asc" }],
    }),
    prisma.account.findMany({
      where: { isActive: true, isSummary: false },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.counterparty.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
      select: { id: true, name: true },
    }),
    prisma.businessUnit.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">自動仕訳ルール</h1>
          <p className="text-sm text-muted-foreground">
            摘要や金額からマッチさせて勘定科目を自動推定するルール
          </p>
        </div>
        <RuleForm
          mode="create"
          accounts={accounts}
          counterparties={counterparties}
          businessUnits={businessUnits}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ルール一覧（{rules.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">優先</TableHead>
                  <TableHead>ルール名 / マッチ条件</TableHead>
                  <TableHead>借方科目</TableHead>
                  <TableHead>貸方科目</TableHead>
                  <TableHead className="w-24 text-right">適用回数</TableHead>
                  <TableHead className="w-24">最終適用</TableHead>
                  <TableHead className="w-20">状態</TableHead>
                  <TableHead className="w-40">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      ルールがまだ登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((r) => {
                    const debit = r.debitAccountId ? accountMap.get(r.debitAccountId) : null;
                    const credit = r.creditAccountId ? accountMap.get(r.creditAccountId) : null;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-sm">{r.priority}</TableCell>
                        <TableCell>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.matchKeyword && <span>キーワード: {r.matchKeyword} </span>}
                            {r.matchAmountMin != null && (
                              <span>最小: {r.matchAmountMin.toString()} </span>
                            )}
                            {r.matchAmountMax != null && (
                              <span>最大: {r.matchAmountMax.toString()}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {debit ? (
                            <span className="font-mono text-xs">
                              {debit.code} {debit.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {credit ? (
                            <span className="font-mono text-xs">
                              {credit.code} {credit.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">{r.hitCount}</TableCell>
                        <TableCell className="text-xs">
                          {r.lastHitAt ? format(new Date(r.lastHitAt), "yyyy/MM/dd") : "-"}
                        </TableCell>
                        <TableCell>
                          {r.isActive ? <Badge>有効</Badge> : <Badge variant="secondary">無効</Badge>}
                        </TableCell>
                        <TableCell>
                          <RuleForm
                            mode="edit"
                            item={{
                              id: r.id,
                              name: r.name,
                              priority: r.priority,
                              isActive: r.isActive,
                              matchKeyword: r.matchKeyword,
                              matchAmountMin: r.matchAmountMin,
                              matchAmountMax: r.matchAmountMax,
                              counterpartyId: r.counterpartyId,
                              debitAccountId: r.debitAccountId,
                              creditAccountId: r.creditAccountId,
                              taxCategory: r.taxCategory,
                              businessUnitId: r.businessUnitId,
                              description: r.description,
                            }}
                            accounts={accounts}
                            counterparties={counterparties}
                            businessUnits={businessUnits}
                          />
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
