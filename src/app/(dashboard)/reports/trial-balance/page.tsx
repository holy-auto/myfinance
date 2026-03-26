"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

export default function TrialBalancePage() {
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<TrialBalanceRow[]>([]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fromDate = formData.get("fromDate") as string;
    const toDate = formData.get("toDate") as string;

    startTransition(async () => {
      const res = await fetch(
        `/api/v1/reports/trial-balance?fromDate=${fromDate}&toDate=${toDate}`
      );
      if (res.ok) {
        setRows(await res.json());
      }
    });
  }

  const totalDebit = rows.reduce((sum, r) => sum + r.debitTotal, 0);
  const totalCredit = rows.reduce((sum, r) => sum + r.creditTotal, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">試算表</h1>

      <Card>
        <CardHeader>
          <CardTitle>期間指定</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">開始日</Label>
              <Input id="fromDate" name="fromDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">終了日</Label>
              <Input id="toDate" name="toDate" type="date" required />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "取得中..." : "表示"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">コード</TableHead>
                <TableHead>勘定科目</TableHead>
                <TableHead className="w-32 text-right">借方合計</TableHead>
                <TableHead className="w-32 text-right">貸方合計</TableHead>
                <TableHead className="w-32 text-right">残高</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.accountId}>
                  <TableCell className="font-mono">{row.accountCode}</TableCell>
                  <TableCell>{row.accountName}</TableCell>
                  <TableCell className="text-right font-mono">
                    {row.debitTotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {row.creditTotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {row.balance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-bold">
                  合計
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {totalDebit.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {totalCredit.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {(totalDebit - totalCredit).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
}
