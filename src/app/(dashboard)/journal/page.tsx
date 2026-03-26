export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import type { Decimal } from "decimal.js";
import { ENTRY_STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  PENDING_APPROVAL: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  REVERSED: "secondary",
};

export default async function JournalPage() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: { entryDate: "desc" },
    include: {
      lines: { include: { account: true } },
      createdBy: { select: { name: true } },
    },
    take: 100,
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">伝票番号</TableHead>
              <TableHead className="w-28">日付</TableHead>
              <TableHead>摘要</TableHead>
              <TableHead className="w-28 text-right">借方計</TableHead>
              <TableHead className="w-28 text-right">貸方計</TableHead>
              <TableHead className="w-24">ステータス</TableHead>
              <TableHead className="w-24">作成者</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  仕訳がありません
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry: { id: string; entryNumber: string; entryDate: Date; description: string; status: string; createdBy: { name: string }; lines: { debit: Decimal; credit: Decimal }[] }) => {
                const totalDebit = entry.lines.reduce(
                  (sum: number, l: { debit: Decimal }) => sum + Number(l.debit),
                  0
                );
                const totalCredit = entry.lines.reduce(
                  (sum: number, l: { credit: Decimal }) => sum + Number(l.credit),
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
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right font-mono">
                      {totalDebit.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {totalCredit.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[entry.status] ?? "outline"}>
                        {ENTRY_STATUS_LABELS[entry.status] ?? entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.createdBy.name}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
