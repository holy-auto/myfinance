"use client";
import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface Account { id: string; code: string; name: string }
interface LedgerRow { entryNumber: string; entryDate: string; description: string; debit: number; credit: number; balance: number }

const fmt = (n: number) => n === 0 ? "-" : n.toLocaleString("ja-JP");

export default function GeneralLedgerPage() {
  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [ledger, setLedger] = useState<{ account: Account; rows: LedgerRow[] } | null>(null);

  useEffect(() => {
    fetch("/api/v1/accounts").then((r) => r.json()).then(setAccounts).catch(console.error);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await fetch(`/api/v1/reports/general-ledger?accountId=${accountId}&fromDate=${fd.get("fromDate")}&toDate=${fd.get("toDate")}`);
      if (res.ok) setLedger(await res.json());
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">総勘定元帳</h1>
      <Card>
        <CardHeader><CardTitle>検索条件</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2 w-64">
              <Label>勘定科目</Label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="">選択してください</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} {a.name}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>開始日</Label><Input name="fromDate" type="date" defaultValue="2026-01-01" required /></div>
            <div className="space-y-2"><Label>終了日</Label><Input name="toDate" type="date" defaultValue="2026-03-31" required /></div>
            <Button type="submit" disabled={isPending || !accountId}>{isPending ? "取得中..." : "表示"}</Button>
          </form>
        </CardContent>
      </Card>

      {ledger && (
        <Card>
          <CardHeader>
            <CardTitle>総勘定元帳 - {ledger.account.code} {ledger.account.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {ledger.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">該当データなし</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">伝票番号</TableHead>
                    <TableHead className="w-28">日付</TableHead>
                    <TableHead>摘要</TableHead>
                    <TableHead className="w-28 text-right">借方</TableHead>
                    <TableHead className="w-28 text-right">貸方</TableHead>
                    <TableHead className="w-28 text-right">残高</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.rows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm">{row.entryNumber}</TableCell>
                      <TableCell>{format(new Date(row.entryDate), "yyyy/MM/dd")}</TableCell>
                      <TableCell className="text-sm">{row.description}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(row.debit)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(row.credit)}</TableCell>
                      <TableCell className="text-right font-mono font-bold">{row.balance.toLocaleString("ja-JP")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
