export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import type { Account } from "@/generated/prisma/client";
import { ACCOUNT_TYPE_LABELS } from "@/lib/constants";
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

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { code: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">勘定科目一覧</h1>
        <Link href="/accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">コード</TableHead>
              <TableHead>科目名</TableHead>
              <TableHead className="w-20">区分</TableHead>
              <TableHead className="w-20">借/貸</TableHead>
              <TableHead className="w-20">状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  勘定科目がありません
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account: Account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono">{account.code}</TableCell>
                  <TableCell>
                    <Link
                      href={`/accounts/${account.id}`}
                      className="text-primary hover:underline"
                    >
                      {"　".repeat(account.level)}
                      {account.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.normalBalance === "DEBIT" ? "借方" : "貸方"}
                  </TableCell>
                  <TableCell>
                    {account.isActive ? (
                      <Badge variant="default">有効</Badge>
                    ) : (
                      <Badge variant="secondary">無効</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
