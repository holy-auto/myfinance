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
import { yen } from "@/lib/format";
import { CashFlowPicker } from "./picker";

const CASH_CODE_PREFIXES = ["1100", "1110", "1120"];

const SECTION_RULES: { code: string; label: string; section: string }[] = [
  { code: "4", label: "売上収入", section: "営業活動" },
  { code: "5", label: "仕入支出（売上原価）", section: "営業活動" },
  { code: "6", label: "販管費支払", section: "営業活動" },
  { code: "7", label: "営業外損益", section: "営業活動" },
  { code: "1900", label: "固定資産取得/売却", section: "投資活動" },
  { code: "1950", label: "ソフトウェア", section: "投資活動" },
  { code: "2", label: "借入/返済 (負債変動)", section: "財務活動" },
  { code: "3", label: "資本/配当", section: "財務活動" },
];

function classify(code: string): string {
  for (const r of SECTION_RULES) {
    if (code.startsWith(r.code)) return r.section;
  }
  return "その他";
}
function classifyLabel(code: string, type: string): string {
  if (type === "REVENUE") return "売上収入";
  if (type === "EXPENSE") {
    if (code.startsWith("5")) return "仕入・原価支払";
    return "販管費・営業外支払";
  }
  if (type === "ASSET") {
    if (code.startsWith("19")) return "固定資産投資";
    return "資産変動";
  }
  if (type === "LIABILITY") return "負債変動";
  if (type === "EQUITY") return "資本変動";
  return "その他";
}

export default async function CashFlowPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const fromDate = sp.from
    ? new Date(sp.from)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const toDate = sp.to
    ? new Date(sp.to)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const cashEntries = await prisma.journalEntry.findMany({
    where: {
      status: "APPROVED",
      entryDate: { gte: fromDate, lte: toDate },
      lines: { some: { account: { code: { in: CASH_CODE_PREFIXES } } } },
    },
    include: {
      lines: { include: { account: true } },
    },
  });

  const sections = new Map<string, Map<string, Decimal>>();
  let totalNet = new Decimal(0);

  for (const entry of cashEntries) {
    const cashLines = entry.lines.filter((l) => CASH_CODE_PREFIXES.includes(l.account.code));
    const counterLines = entry.lines.filter((l) => !CASH_CODE_PREFIXES.includes(l.account.code));
    if (cashLines.length === 0 || counterLines.length === 0) continue;

    let cashChange = new Decimal(0);
    for (const c of cashLines) {
      cashChange = cashChange
        .plus(new Decimal(c.debit.toString()))
        .minus(new Decimal(c.credit.toString()));
    }

    for (const cnt of counterLines) {
      const lineAmount = new Decimal(cnt.debit.toString()).plus(new Decimal(cnt.credit.toString()));
      const totalCounter = counterLines.reduce(
        (s, l) => s.plus(new Decimal(l.debit.toString())).plus(new Decimal(l.credit.toString())),
        new Decimal(0)
      );
      if (totalCounter.equals(0)) continue;
      const allocatedCash = cashChange.times(lineAmount).dividedBy(totalCounter);

      const section = classify(cnt.account.code);
      const label = classifyLabel(cnt.account.code, cnt.account.type);
      if (!sections.has(section)) sections.set(section, new Map());
      const sec = sections.get(section)!;
      sec.set(label, (sec.get(label) ?? new Decimal(0)).plus(allocatedCash));
      totalNet = totalNet.plus(allocatedCash);
    }
  }

  const beginningCash = await prisma.journalLine.aggregate({
    _sum: { debit: true, credit: true },
    where: {
      account: { code: { in: CASH_CODE_PREFIXES } },
      journalEntry: { entryDate: { lt: fromDate }, status: "APPROVED" },
    },
  });
  const startingBalance = new Decimal(beginningCash._sum.debit?.toString() ?? "0").minus(
    new Decimal(beginningCash._sum.credit?.toString() ?? "0")
  );
  const endingBalance = startingBalance.plus(totalNet);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">キャッシュフロー計算書（簡易・直接法）</h1>
        <p className="text-sm text-muted-foreground">
          現金・普通預金・当座預金の動きを区分別に集計（承認済み仕訳のみ）
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>集計期間</CardTitle>
        </CardHeader>
        <CardContent>
          <CashFlowPicker
            from={fromDate.toISOString().split("T")[0]}
            to={toDate.toISOString().split("T")[0]}
          />
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">期首キャッシュ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yen(startingBalance.toNumber())}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">期中増減</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalNet.gte(0) ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {yen(totalNet.toNumber())}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">期末キャッシュ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yen(endingBalance.toNumber())}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>区分別キャッシュフロー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">区分</TableHead>
                  <TableHead>項目</TableHead>
                  <TableHead className="w-40 text-right">金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.size === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      対象期間にキャッシュ取引がありません
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.from(sections.entries()).flatMap(([section, items]) => {
                    const subTotal = Array.from(items.values()).reduce(
                      (s, v) => s.plus(v),
                      new Decimal(0)
                    );
                    return [
                      ...Array.from(items.entries()).map(([label, value]) => (
                        <TableRow key={section + label}>
                          <TableCell className="text-xs">{section}</TableCell>
                          <TableCell>{label}</TableCell>
                          <TableCell
                            className={`text-right font-mono ${
                              value.gte(0) ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {yen(value.toNumber())}
                          </TableCell>
                        </TableRow>
                      )),
                      <TableRow key={section + "subtotal"} className="bg-muted/40 font-semibold">
                        <TableCell colSpan={2}>{section} 小計</TableCell>
                        <TableCell
                          className={`text-right font-mono ${
                            subTotal.gte(0) ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {yen(subTotal.toNumber())}
                        </TableCell>
                      </TableRow>,
                    ];
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
