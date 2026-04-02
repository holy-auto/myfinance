export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { JournalActionButtons } from "../journal-action-buttons";

const STATUS_VARIANT: Record<
  string,
  "outline" | "secondary" | "default" | "destructive"
> = {
  DRAFT: "outline",
  PENDING_APPROVAL: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  REVERSED: "outline",
};

const ENTRY_STATUS_LABELS: Record<string, string> = {
  DRAFT: "下書き",
  PENDING_APPROVAL: "承認待ち",
  APPROVED: "承認済み",
  REJECTED: "却下",
  REVERSED: "取消済み",
};

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: {
      lines: {
        include: { account: true },
        orderBy: { lineOrder: "asc" },
      },
      createdBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
  });

  if (!entry) notFound();

  const totalDebit = entry.lines.reduce((s, l) => s + Number(l.debit), 0);
  const totalCredit = entry.lines.reduce((s, l) => s + Number(l.credit), 0);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/journal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{entry.entryNumber}</h1>
        <Badge variant={STATUS_VARIANT[entry.status] ?? "outline"}>
          {ENTRY_STATUS_LABELS[entry.status] ?? entry.status}
        </Badge>
      </div>

      {/* Header info */}
      <Card>
        <CardHeader>
          <CardTitle>伝票情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm md:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">伝票日付</dt>
              <dd className="font-medium">
                {format(new Date(entry.entryDate), "yyyy年MM月dd日")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">会計年月</dt>
              <dd className="font-medium">
                {entry.fiscalYear}年{entry.fiscalMonth}月
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">作成者</dt>
              <dd className="font-medium">{entry.createdBy?.name ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">承認者</dt>
              <dd className="font-medium">
                {entry.approvedBy?.name ?? "-"}
                {entry.approvedAt &&
                  ` (${format(new Date(entry.approvedAt), "MM/dd HH:mm")})`}
              </dd>
            </div>
            <div className="col-span-2 md:col-span-4">
              <dt className="text-muted-foreground">摘要</dt>
              <dd className="font-medium">{entry.description}</dd>
            </div>
            {entry.rejectedReason && (
              <div className="col-span-2 md:col-span-4">
                <dt className="text-muted-foreground text-destructive">
                  却下理由
                </dt>
                <dd className="font-medium text-destructive">
                  {entry.rejectedReason}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Lines */}
      <Card>
        <CardHeader>
          <CardTitle>仕訳明細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead className="w-24">コード</TableHead>
                  <TableHead>勘定科目</TableHead>
                  <TableHead className="w-32 text-right">借方</TableHead>
                  <TableHead className="w-32 text-right">貸方</TableHead>
                  <TableHead>摘要</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.lines.map((line, idx) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {line.account.code}
                    </TableCell>
                    <TableCell>{line.account.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(line.debit) > 0
                        ? `¥${Number(line.debit).toLocaleString()}`
                        : ""}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(line.credit) > 0
                        ? `¥${Number(line.credit).toLocaleString()}`
                        : ""}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {line.description ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    合計
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ¥{totalDebit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ¥{totalCredit.toLocaleString()}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <JournalActionButtons entryId={entry.id} status={entry.status} />
        <Link href="/journal">
          <Button variant="outline">一覧に戻る</Button>
        </Link>
      </div>
    </div>
  );
}
