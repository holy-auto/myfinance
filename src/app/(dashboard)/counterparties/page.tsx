export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { COUNTERPARTY_KIND_LABELS } from "@/lib/constants";

export default async function CounterpartiesPage() {
  const items = await prisma.counterparty.findMany({
    orderBy: [{ isActive: "desc" }, { code: "asc" }],
  });

  const totalActive = items.filter((c) => c.isActive).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">取引先管理</h1>
          <p className="text-sm text-muted-foreground">
            得意先・仕入先の登録、インボイス登録番号の管理
          </p>
        </div>
        <Link href="/counterparties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            一覧（有効: {totalActive}件 / 全{items.length}件）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">コード</TableHead>
                  <TableHead>取引先名</TableHead>
                  <TableHead className="w-32">区分</TableHead>
                  <TableHead className="w-44">登録番号</TableHead>
                  <TableHead className="w-44">連絡先</TableHead>
                  <TableHead className="w-20">状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      取引先が登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">{c.code}</TableCell>
                      <TableCell>
                        <Link
                          href={`/counterparties/${c.id}`}
                          className="text-primary hover:underline"
                        >
                          {c.name}
                        </Link>
                        {c.nameKana && (
                          <div className="text-xs text-muted-foreground">{c.nameKana}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {COUNTERPARTY_KIND_LABELS[c.kind] ?? c.kind}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.registrationNo ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>{c.email ?? ""}</div>
                        <div>{c.phone ?? ""}</div>
                      </TableCell>
                      <TableCell>
                        {c.isActive ? (
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
        </CardContent>
      </Card>
    </div>
  );
}
