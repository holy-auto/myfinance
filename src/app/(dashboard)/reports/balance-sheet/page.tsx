"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BsRow { code: string; name: string; balance: number }
interface BsData {
  assets: BsRow[]; liabilities: BsRow[]; equity: BsRow[];
  totalAssets: number; totalLiabilities: number; totalEquity: number;
}
const fmt = (n: number) => n.toLocaleString("ja-JP");

function Section({ title, rows, total }: { title: string; rows: BsRow[]; total: number }) {
  return (
    <div>
      <div className="font-bold text-sm bg-muted px-3 py-1 rounded">{title}</div>
      <div className="mt-1 space-y-0.5 px-2">
        {rows.map((r) => (
          <div key={r.code} className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground pl-4">{r.name}</span>
            <span className="font-mono text-sm">¥{fmt(r.balance)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold border-t pt-1">
          <span className="text-sm">{title}合計</span>
          <span className="font-mono text-sm">¥{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function BalanceSheetPage() {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<BsData | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await fetch(`/api/v1/reports/balance-sheet?asOfDate=${fd.get("asOfDate")}`);
      if (res.ok) setData(await res.json());
    });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">貸借対照表（BS）</h1>
      <Card>
        <CardHeader><CardTitle>基準日指定</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="space-y-2"><Label>基準日</Label><Input name="asOfDate" type="date" defaultValue="2026-03-31" required /></div>
            <Button type="submit" disabled={isPending}>{isPending ? "取得中..." : "表示"}</Button>
          </form>
        </CardContent>
      </Card>

      {data && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>資産の部</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Section title="資産" rows={data.assets} total={data.totalAssets} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>負債・純資産の部</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Section title="負債" rows={data.liabilities} total={data.totalLiabilities} />
              <Separator />
              <Section title="純資産" rows={data.equity} total={data.totalEquity} />
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>負債・純資産合計</span>
                <span className="font-mono">¥{fmt(data.totalLiabilities + data.totalEquity)}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 bg-muted/50">
            <CardContent className="flex justify-between items-center py-3">
              <span className="font-bold">貸借チェック</span>
              <span className={`font-mono font-bold ${Math.abs(data.totalAssets - data.totalLiabilities - data.totalEquity) < 1 ? "text-green-600" : "text-red-600"}`}>
                {Math.abs(data.totalAssets - data.totalLiabilities - data.totalEquity) < 1 ? "✓ 一致" : `差額: ¥${fmt(data.totalAssets - data.totalLiabilities - data.totalEquity)}`}
              </span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
