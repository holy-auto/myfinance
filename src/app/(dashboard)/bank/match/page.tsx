export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
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
import { format } from "date-fns";
import { yen } from "@/lib/format";
import { BANK_TX_STATUS_LABELS } from "@/lib/constants";
import { MatchActions, AutoMatchButton } from "./match-actions";

export default async function BankMatchPage() {
  const [transactions, banks] = await Promise.all([
    prisma.bankTransaction.findMany({
      orderBy: [{ status: "asc" }, { txDate: "desc" }],
      take: 200,
      include: {
        bankAccount: { select: { code: true, name: true } },
        matchedJournal: { select: { id: true, entryNumber: true, description: true } },
      },
    }),
    prisma.bankAccount.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
  ]);

  const stats = {
    unmatched: transactions.filter((t) => t.status === "UNMATCHED").length,
    matched: transactions.filter((t) => t.status === "MATCHED").length,
    ignored: transactions.filter((t) => t.status === "IGNORED").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">銀行明細 突合</h1>
          <p className="text-sm text-muted-foreground">
            金額・日付ベースで仕訳と突合します
          </p>
        </div>
        <AutoMatchButton banks={banks} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">未突合</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unmatched}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">突合済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.matched}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">対象外</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.ignored}件</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>明細一覧（直近200件）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">日付</TableHead>
                  <TableHead className="w-28">口座</TableHead>
                  <TableHead>摘要</TableHead>
                  <TableHead className="w-28 text-right">入金</TableHead>
                  <TableHead className="w-28 text-right">出金</TableHead>
                  <TableHead className="w-24">状態</TableHead>
                  <TableHead className="w-40">仕訳</TableHead>
                  <TableHead className="w-40">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      明細データがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs">
                        {format(new Date(t.txDate), "yyyy/MM/dd")}
                      </TableCell>
                      <TableCell className="text-xs">
                        {t.bankAccount.code}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {t.description}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {Number(t.amountIn) > 0 ? yen(t.amountIn) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {Number(t.amountOut) > 0 ? yen(t.amountOut) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.status === "MATCHED"
                              ? "default"
                              : t.status === "UNMATCHED"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {BANK_TX_STATUS_LABELS[t.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {t.matchedJournal ? (
                          <a
                            href={`/journal/${t.matchedJournal.id}`}
                            className="text-primary hover:underline font-mono"
                          >
                            {t.matchedJournal.entryNumber}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <MatchActions
                          txId={t.id}
                          status={t.status}
                          amount={
                            Number(t.amountIn) > 0
                              ? Number(t.amountIn)
                              : Number(t.amountOut)
                          }
                          txDate={t.txDate.toISOString()}
                        />
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
