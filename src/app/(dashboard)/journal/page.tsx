export const dynamic = "force-dynamic";

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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { JournalActionButtons } from "./journal-action-buttons";

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

export default async function JournalPage() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: { entryDate: "desc" },
    take: 100,
    include: {
      lines: true,
      createdBy: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">仕訳一覧</h1>
        <Link href="/journal/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規仕訳
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>仕訳リスト（直近100件）</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              仕訳がありません。「新規仕訳」から入力してください。
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">伝票番号</TableHead>
                    <TableHead className="w-28">日付</TableHead>
                    <TableHead>摘要</TableHead>
                    <TableHead className="w-28 text-right">借方合計</TableHead>
                    <TableHead className="w-28 text-right">貸方合計</TableHead>
                    <TableHead className="w-28">ステータス</TableHead>
                    <TableHead className="w-20">作成者</TableHead>
                    <TableHead className="w-56">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map(
                    (entry: {
                      id: string;
                      entryNumber: string;
                      entryDate: Date;
                      description: string;
                      status: string;
                      lines: Array<{ debit: unknown; credit: unknown }>;
                      createdBy: { name: string } | null;
                    }) => {
                      const totalDebit = entry.lines.reduce(
                        (s, l) => s + Number(l.debit),
                        0
                      );
                      const totalCredit = entry.lines.reduce(
                        (s, l) => s + Number(l.credit),
                        0
                      );
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-mono text-sm">
                            <Link
                              href={`/journal/${entry.id}`}
                              className="text-primary hover:underline"
                            >
                              {entry.entryNumber}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {format(new Date(entry.entryDate), "yyyy/MM/dd")}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.description}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ¥{totalDebit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ¥{totalCredit.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                STATUS_VARIANT[entry.status] ?? "outline"
                              }
                            >
                              {ENTRY_STATUS_LABELS[entry.status] ??
                                entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.createdBy?.name ?? "-"}
                          </TableCell>
                          <TableCell>
                            <JournalActionButtons
                              entryId={entry.id}
                              status={entry.status}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
