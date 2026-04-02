"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PnlRow { code: string; name: string; balance: number }
interface PnlData {
  revenue: PnlRow[]; expense: PnlRow[];
  totalRevenue: number; totalExpense: number;
  grossProfit: number; operatingProfit: number; ordinaryProfit: number; netProfit: number;
  costOfSales: number; sgaExpense: number; otherExpense: number;
}

const fmt = (n: number) => n.toLocaleString("ja-JP");

function Row({ label, value, bold, indent }: { label: string; value: number; bold?: boolean; indent?: number }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? "font-bold" : ""} ${indent ? `pl-${indent * 4}` : ""}`}>
      <span className={`text-sm ${indent ? "text-muted-foreground" : ""}`}>{label}</span>
      <span className={`font-mono text-sm ${value < 0 ? "text-red-600" : ""}`}>¥{fmt(value)}</span>
    </div>
  );
}

export default function PnlPage() {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<PnlData | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await fetch(`/api/v1/reports/pnl?fromDate=${fd.get("fromDate")}&toDate=${fd.get("toDate")}`);
      if (res.ok) setData(await res.json());
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">損益計算書（PL）</h1>
      <Card>
        <CardHeader><CardTitle>期間指定</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="space-y-2"><Label htmlFor="fromDate">開始日</Label><Input id="fromDate" name="fromDate" type="date" defaultValue="2026-01-01" required /></div>
            <div className="space-y-2"><Label htmlFor="toDate">終了日</Label><Input id="toDate" name="toDate" type="date" defaultValue="2026-03-31" required /></div>
            <Button type="submit" disabled={isPending}>{isPending ? "取得中..." : "表示"}</Button>
          </form>
        </CardContent>
      </Card>

      {data && (
        <Card>
          <CardHeader><CardTitle>損益計算書</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="font-semibold text-sm text-muted-foreground border-b pb-1">売上高</div>
            {data.revenue.map((r) => <Row key={r.code} label={r.name} value={r.balance} indent={1} />)}
            <Row label="売上高 合計" value={data.totalRevenue} bold />
            <Separator />
            <div className="font-semibold text-sm text-muted-foreground border-b pb-1">売上原価</div>
            {data.expense.filter((r) => r.code.startsWith("5")).map((r) => <Row key={r.code} label={r.name} value={r.balance} indent={1} />)}
            <Row label="売上原価 合計" value={data.costOfSales} bold />
            <Separator />
            <Row label="売上総利益（粗利）" value={data.grossProfit} bold />
            <Separator />
            <div className="font-semibold text-sm text-muted-foreground border-b pb-1">販売費及び一般管理費</div>
            {data.expense.filter((r) => r.code.startsWith("6")).map((r) => <Row key={r.code} label={r.name} value={r.balance} indent={1} />)}
            <Row label="販管費 合計" value={data.sgaExpense} bold />
            <Separator />
            <Row label="営業利益" value={data.operatingProfit} bold />
            <Separator />
            {data.expense.filter((r) => r.code.startsWith("7")).length > 0 && (
              <>
                <div className="font-semibold text-sm text-muted-foreground border-b pb-1">営業外費用</div>
                {data.expense.filter((r) => r.code.startsWith("7")).map((r) => <Row key={r.code} label={r.name} value={r.balance} indent={1} />)}
                <Row label="営業外費用 合計" value={data.otherExpense} bold />
                <Separator />
              </>
            )}
            <Row label="経常利益" value={data.ordinaryProfit} bold />
            <Separator />
            <Row label="当期純利益" value={data.netProfit} bold />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
