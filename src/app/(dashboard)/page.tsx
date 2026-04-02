"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BookOpen, Clock, Wallet, BarChart2 } from "lucide-react";

interface DashboardData {
  monthlyEntryCount: number;
  pendingCount: number;
  closingStatus: string;
  totalRevenue: number;
  totalExpense: number;
  grossProfit: number;
  operatingProfit: number;
  cashBalance: number;
  monthlyTrend: { month: string; revenue: number; expense: number; profit: number }[];
}

const fmt = (n: number) => n.toLocaleString("ja-JP");

const CLOSING_LABELS: Record<string, string> = { OPEN: "未締め", CLOSING: "締め処理中", CLOSED: "締め済み" };
const CLOSING_VARIANT: Record<string, "default" | "secondary" | "outline"> = { OPEN: "outline", CLOSING: "secondary", CLOSED: "default" };

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/v1/dashboard").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-center text-muted-foreground">読み込み中...</div>;

  const grossProfitRate = data.totalRevenue > 0 ? ((data.grossProfit / data.totalRevenue) * 100).toFixed(1) : "0.0";
  const operatingProfitRate = data.totalRevenue > 0 ? ((data.operatingProfit / data.totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">当期売上高</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{fmt(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">粗利率 {grossProfitRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">営業利益</CardTitle>
            <BarChart2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.operatingProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ¥{fmt(data.operatingProfit)}
            </div>
            <p className="text-xs text-muted-foreground">営業利益率 {operatingProfitRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">現金・預金残高</CardTitle>
            <Wallet className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{fmt(data.cashBalance)}</div>
            <p className="text-xs text-muted-foreground">現金・普通・当座預金合計</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今月仕訳件数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.monthlyEntryCount}</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">粗利益</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.grossProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              ¥{fmt(data.grossProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">当期費用合計</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">¥{fmt(data.totalExpense)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingCount}</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今月締めステータス</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={CLOSING_VARIANT[data.closingStatus] ?? "outline"} className="text-base px-3 py-1">
              {CLOSING_LABELS[data.closingStatus] ?? data.closingStatus}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 月次推移テーブル（rechartsを使わない軽量版） */}
      <Card>
        <CardHeader>
          <CardTitle>月次推移（直近6ヶ月）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">月</th>
                  <th className="text-right py-2 px-3 text-indigo-600">売上</th>
                  <th className="text-right py-2 px-3 text-orange-500">費用</th>
                  <th className="text-right py-2 px-3 text-emerald-600">利益</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyTrend.map((row) => (
                  <tr key={row.month} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium">{row.month}</td>
                    <td className="text-right py-2 px-3 font-mono">¥{fmt(row.revenue)}</td>
                    <td className="text-right py-2 px-3 font-mono">¥{fmt(row.expense)}</td>
                    <td className={`text-right py-2 px-3 font-mono font-bold ${row.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      ¥{fmt(row.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
