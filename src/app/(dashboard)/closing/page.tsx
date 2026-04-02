"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Lock, LockOpen } from "lucide-react";

interface Period { id: string; fiscalYear: number; fiscalMonth: number; status: string; closedAt: string | null; closedBy?: { name: string } | null }

const STATUS_LABELS: Record<string, string> = { OPEN: "未締め", CLOSING: "締め処理中", CLOSED: "締め済み" };
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = { OPEN: "outline", CLOSING: "secondary", CLOSED: "default" };

export default function ClosingPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isPending, startTransition] = useTransition();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const load = () => {
    fetch("/api/v1/dashboard").then(() => {}).catch(() => {});
    // load periods from a simple API or use server component data
  };

  useEffect(() => {
    // Get periods via API (use journal endpoint as proxy)
    fetch("/api/v1/closing/list").then((r) => r.ok ? r.json() : []).then(setPeriods).catch(() => setPeriods([]));
  }, []);

  function handleAction(action: "close" | "reopen") {
    startTransition(async () => {
      const res = await fetch("/api/v1/closing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fiscalYear: year, fiscalMonth: month, action }),
      });
      if (res.ok) {
        toast.success(action === "close" ? `${year}年${month}月を締めました` : `${year}年${month}月を再開しました`);
        // Reload
        window.location.reload();
      } else {
        toast.error("処理に失敗しました");
      }
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">月次締め</h1>

      <Card>
        <CardHeader><CardTitle>締め操作</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>年度</Label>
            <Input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-24" />
          </div>
          <div className="space-y-2">
            <Label>月</Label>
            <Input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-20" />
          </div>
          <Button onClick={() => handleAction("close")} disabled={isPending} className="gap-2">
            <Lock className="h-4 w-4" />月次締め実行
          </Button>
          <Button onClick={() => handleAction("reopen")} disabled={isPending} variant="outline" className="gap-2">
            <LockOpen className="h-4 w-4" />再オープン
          </Button>
        </CardContent>
      </Card>

      <ClosingPeriodsTable />
    </div>
  );
}

function ClosingPeriodsTable() {
  const [periods, setPeriods] = useState<Period[]>([]);
  useEffect(() => {
    fetch("/api/v1/closing/list").then((r) => r.ok ? r.json() : []).then(setPeriods).catch(() => {});
  }, []);

  return (
    <Card>
      <CardHeader><CardTitle>締め期間一覧</CardTitle></CardHeader>
      <CardContent>
        {periods.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">データを読み込んでいます...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>年度</TableHead><TableHead>月</TableHead>
                <TableHead>ステータス</TableHead><TableHead>締め日時</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.fiscalYear}</TableCell>
                  <TableCell>{p.fiscalMonth}月</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[p.status] ?? "outline"}>{STATUS_LABELS[p.status] ?? p.status}</Badge></TableCell>
                  <TableCell>{p.closedAt ? format(new Date(p.closedAt), "yyyy/MM/dd HH:mm") : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
