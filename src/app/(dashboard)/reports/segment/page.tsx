export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { yen, pct } from "@/lib/format";
import { SegmentPicker } from "./picker";

export default async function SegmentReportPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ? parseInt(sp.year, 10) : now.getFullYear();
  const fromDate = sp.from ? new Date(sp.from) : new Date(year, 0, 1);
  const toDate = sp.to ? new Date(sp.to) : new Date(year, 11, 31, 23, 59, 59);

  const [businessUnits, lines] = await Promise.all([
    prisma.businessUnit.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
    prisma.journalLine.findMany({
      where: {
        journalEntry: {
          status: "APPROVED",
          entryDate: { gte: fromDate, lte: toDate },
        },
        account: { type: { in: ["REVENUE", "EXPENSE"] } },
      },
      select: {
        debit: true,
        credit: true,
        businessUnitId: true,
        account: { select: { type: true, code: true } },
      },
    }),
  ]);

  type SegmentTotals = {
    name: string;
    revenue: Decimal;
    cogs: Decimal;
    sga: Decimal;
    grossProfit: Decimal;
    operating: Decimal;
  };

  const buMap = new Map<string, SegmentTotals>();
  buMap.set("__none__", {
    name: "未指定 / 全社共通",
    revenue: new Decimal(0),
    cogs: new Decimal(0),
    sga: new Decimal(0),
    grossProfit: new Decimal(0),
    operating: new Decimal(0),
  });
  for (const b of businessUnits) {
    buMap.set(b.id, {
      name: b.name,
      revenue: new Decimal(0),
      cogs: new Decimal(0),
      sga: new Decimal(0),
      grossProfit: new Decimal(0),
      operating: new Decimal(0),
    });
  }

  for (const l of lines) {
    const key = l.businessUnitId ?? "__none__";
    const seg = buMap.get(key);
    if (!seg) continue;
    const debit = new Decimal(l.debit.toString());
    const credit = new Decimal(l.credit.toString());
    if (l.account.type === "REVENUE") {
      seg.revenue = seg.revenue.plus(credit).minus(debit);
    } else {
      const expense = debit.minus(credit);
      if (l.account.code.startsWith("5")) {
        seg.cogs = seg.cogs.plus(expense);
      } else {
        seg.sga = seg.sga.plus(expense);
      }
    }
  }

  const rows = Array.from(buMap.values())
    .map((s) => {
      s.grossProfit = s.revenue.minus(s.cogs);
      s.operating = s.grossProfit.minus(s.sga);
      return s;
    })
    .filter((s) => !s.revenue.isZero() || !s.cogs.isZero() || !s.sga.isZero());

  const totalRevenue = rows.reduce((sum, r) => sum.plus(r.revenue), new Decimal(0));
  const totalCogs = rows.reduce((sum, r) => sum.plus(r.cogs), new Decimal(0));
  const totalSga = rows.reduce((sum, r) => sum.plus(r.sga), new Decimal(0));
  const totalOp = totalRevenue.minus(totalCogs).minus(totalSga);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">事業別PL（セグメントPL）</h1>
        <p className="text-sm text-muted-foreground">
          事業区分別の売上・粗利・営業利益のドリルダウン
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>集計期間</CardTitle>
        </CardHeader>
        <CardContent>
          <SegmentPicker
            from={fromDate.toISOString().split("T")[0]}
            to={toDate.toISOString().split("T")[0]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            事業別 損益（{rows.length}事業）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-40">事業区分</TableHead>
                  <TableHead className="text-right">売上高</TableHead>
                  <TableHead className="text-right">売上原価</TableHead>
                  <TableHead className="text-right">売上総利益</TableHead>
                  <TableHead className="text-right">販管費</TableHead>
                  <TableHead className="text-right">営業利益</TableHead>
                  <TableHead className="text-right">粗利率</TableHead>
                  <TableHead className="text-right">営業利益率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      対象期間にデータがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => {
                    const grossRate = r.revenue.equals(0)
                      ? 0
                      : r.grossProfit.dividedBy(r.revenue).times(100).toNumber();
                    const opRate = r.revenue.equals(0)
                      ? 0
                      : r.operating.dividedBy(r.revenue).times(100).toNumber();
                    return (
                      <TableRow key={r.name}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-right font-mono">
                          {yen(r.revenue.toNumber())}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {yen(r.cogs.toNumber())}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${
                            r.grossProfit.gte(0) ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {yen(r.grossProfit.toNumber())}
                        </TableCell>
                        <TableCell className="text-right font-mono">{yen(r.sga.toNumber())}</TableCell>
                        <TableCell
                          className={`text-right font-mono font-bold ${
                            r.operating.gte(0) ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {yen(r.operating.toNumber())}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {r.revenue.equals(0) ? "-" : pct(grossRate)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {r.revenue.equals(0) ? "-" : pct(opRate)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                {rows.length > 0 && (
                  <TableRow className="bg-muted font-bold">
                    <TableCell>合計</TableCell>
                    <TableCell className="text-right font-mono">{yen(totalRevenue.toNumber())}</TableCell>
                    <TableCell className="text-right font-mono">{yen(totalCogs.toNumber())}</TableCell>
                    <TableCell className="text-right font-mono">
                      {yen(totalRevenue.minus(totalCogs).toNumber())}
                    </TableCell>
                    <TableCell className="text-right font-mono">{yen(totalSga.toNumber())}</TableCell>
                    <TableCell
                      className={`text-right font-mono ${
                        totalOp.gte(0) ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {yen(totalOp.toNumber())}
                    </TableCell>
                    <TableCell />
                    <TableCell className="text-right font-mono text-xs">
                      {totalRevenue.equals(0)
                        ? "-"
                        : pct(totalOp.dividedBy(totalRevenue).times(100).toNumber())}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
