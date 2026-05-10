export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function RolesPage() {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">ロール管理</h1>
        <p className="text-sm text-muted-foreground">
          システム標準ロールと付与されている権限の一覧
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ロール一覧（{roles.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">ロール名</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>権限</TableHead>
                  <TableHead className="w-24 text-right">利用者数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => {
                  const perms = r.permissions.split(",").map((p) => p.trim()).filter(Boolean);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge variant="outline">{r.name}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{r.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {perms.map((p) => (
                            <Badge key={p} variant="secondary" className="text-xs font-mono">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{r._count.users}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
