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
import { DepartmentClient } from "./client";

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({ orderBy: { code: "asc" } });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">部門管理</h1>
          <p className="text-sm text-muted-foreground">
            仕訳明細・経費の部門軸となるマスタ
          </p>
        </div>
        <DepartmentClient mode="create" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>部門一覧（{departments.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">コード</TableHead>
                  <TableHead>部門名</TableHead>
                  <TableHead className="w-24">状態</TableHead>
                  <TableHead className="w-40">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      部門が登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-sm">{d.code}</TableCell>
                      <TableCell>{d.name}</TableCell>
                      <TableCell>
                        {d.isActive ? (
                          <Badge>有効</Badge>
                        ) : (
                          <Badge variant="secondary">無効</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DepartmentClient
                          mode="edit"
                          item={{ id: d.id, code: d.code, name: d.name, isActive: d.isActive }}
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
