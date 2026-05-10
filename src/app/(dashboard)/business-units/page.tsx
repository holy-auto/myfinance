export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
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
import { BusinessUnitClient } from "./client";

export default async function BusinessUnitsPage() {
  const items = await prisma.businessUnit.findMany({ orderBy: { code: "asc" } });

  const counts = await prisma.journalLine.groupBy({
    by: ["businessUnitId"],
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.businessUnitId, c._count._all]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">事業区分</h1>
          <p className="text-sm text-muted-foreground">
            事業別PLや管理会計の集計軸
          </p>
        </div>
        <BusinessUnitClient mode="create" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>事業区分一覧（{items.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">コード</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead className="w-32 text-right">仕訳明細数</TableHead>
                  <TableHead className="w-24">状態</TableHead>
                  <TableHead className="w-40">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      事業区分が登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-sm">{b.code}</TableCell>
                      <TableCell>{b.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {countMap.get(b.id) ?? 0}
                      </TableCell>
                      <TableCell>
                        {b.isActive ? (
                          <Badge>有効</Badge>
                        ) : (
                          <Badge variant="secondary">無効</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <BusinessUnitClient
                          mode="edit"
                          item={{ id: b.id, code: b.code, name: b.name, isActive: b.isActive }}
                        />
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
