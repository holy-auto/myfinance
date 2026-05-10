export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BANK_ACCOUNT_TYPE_LABELS } from "@/lib/constants";
import { yen } from "@/lib/format";
import { Upload, Link as LinkIcon } from "lucide-react";
import { BankAccountForm } from "./bank-account-form";

export default async function BankPage() {
  const [accounts, glAccounts] = await Promise.all([
    prisma.bankAccount.findMany({
      orderBy: [{ isActive: "desc" }, { code: "asc" }],
      include: {
        linkedAccount: { select: { code: true, name: true } },
        transactions: {
          select: { amountIn: true, amountOut: true, status: true },
        },
      },
    }),
    prisma.account.findMany({
      where: { type: "ASSET", isActive: true, isSummary: false },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
  ]);

  const stats = accounts.map((b) => {
    const opening = new Decimal(b.openingBalance.toString());
    let inSum = new Decimal(0);
    let outSum = new Decimal(0);
    let unmatched = 0;
    let matched = 0;
    for (const t of b.transactions) {
      inSum = inSum.plus(new Decimal(t.amountIn.toString()));
      outSum = outSum.plus(new Decimal(t.amountOut.toString()));
      if (t.status === "UNMATCHED") unmatched++;
      else if (t.status === "MATCHED") matched++;
    }
    return {
      bank: b,
      balance: opening.plus(inSum).minus(outSum).toNumber(),
      inSum: inSum.toNumber(),
      outSum: outSum.toNumber(),
      unmatched,
      matched,
      total: b.transactions.length,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">銀行・カード口座</h1>
          <p className="text-sm text-muted-foreground">
            預金口座・クレジットカードの登録と明細の取込
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/bank/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              明細インポート
            </Button>
          </Link>
          <Link href="/bank/match">
            <Button variant="outline">
              <LinkIcon className="mr-2 h-4 w-4" />
              突合作業
            </Button>
          </Link>
          <BankAccountForm accounts={glAccounts} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>口座一覧（{accounts.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">コード</TableHead>
                  <TableHead>口座名</TableHead>
                  <TableHead className="w-28">種別</TableHead>
                  <TableHead>銀行/支店</TableHead>
                  <TableHead className="w-40">関連科目</TableHead>
                  <TableHead className="text-right">期首+IN-OUT</TableHead>
                  <TableHead className="w-40 text-right">明細(突合/未)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      口座がまだ登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.map((s) => (
                    <TableRow key={s.bank.id}>
                      <TableCell className="font-mono text-sm">{s.bank.code}</TableCell>
                      <TableCell>
                        {s.bank.name}
                        {!s.bank.isActive && (
                          <Badge variant="secondary" className="ml-2">無効</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {BANK_ACCOUNT_TYPE_LABELS[s.bank.type] ?? s.bank.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {s.bank.bankName} {s.bank.branchName}
                        {s.bank.accountNumber && (
                          <div className="font-mono">No.{s.bank.accountNumber}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {s.bank.linkedAccount
                          ? `${s.bank.linkedAccount.code} ${s.bank.linkedAccount.name}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {yen(s.balance)}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <span className="font-mono">{s.matched}</span> /{" "}
                        <span className="font-mono text-orange-600">{s.unmatched}</span> /{" "}
                        <span className="font-mono">{s.total}</span>
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
