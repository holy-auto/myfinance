export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/table";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "未締め",
  CLOSING: "締め処理中",
  CLOSED: "締め済み",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  OPEN: "outline",
  CLOSING: "secondary",
  CLOSED: "default",
};

export default async function ClosingPage() {
  const periods = await prisma.closingPeriod.findMany({
    orderBy: [{ fiscalYear: "desc" }, { fiscalMonth: "desc" }],
    include: { closedBy: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">月次締め</h1>

      <Card>
        <CardHeader>
          <CardTitle>締め期間一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {periods.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              締め期間が登録されていません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>年度</TableHead>
                  <TableHead>月</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>締め日時</TableHead>
                  <TableHead>担当者</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period: { id: string; fiscalYear: number; fiscalMonth: number; status: string; closedAt: Date | null; closedBy: { name: string } | null }) => (
                  <TableRow key={period.id}>
                    <TableCell>{period.fiscalYear}</TableCell>
                    <TableCell>{period.fiscalMonth}月</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[period.status] ?? "outline"}>
                        {STATUS_LABELS[period.status] ?? period.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {period.closedAt
                        ? format(new Date(period.closedAt), "yyyy/MM/dd HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell>{period.closedBy?.name ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
