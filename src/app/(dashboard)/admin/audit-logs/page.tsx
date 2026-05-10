export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
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
import { AuditFilter } from "./filter";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    entityType?: string;
    userId?: string;
    from?: string;
    to?: string;
    take?: string;
  }>;
}) {
  const sp = await searchParams;
  const take = sp.take ? Math.min(500, parseInt(sp.take, 10)) : 100;

  const where: Record<string, unknown> = {};
  if (sp.action) where.action = sp.action;
  if (sp.entityType) where.entityType = sp.entityType;
  if (sp.userId) where.userId = sp.userId;
  if (sp.from || sp.to) {
    const range: Record<string, Date> = {};
    if (sp.from) range.gte = new Date(sp.from);
    if (sp.to) {
      const end = new Date(sp.to);
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }
    where.createdAt = range;
  }

  const [logs, allUsers] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const distinctActions = await prisma.auditLog.groupBy({ by: ["action"], _count: true });
  const distinctEntities = await prisma.auditLog.groupBy({ by: ["entityType"], _count: true });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">監査ログ</h1>
        <p className="text-sm text-muted-foreground">
          全ユーザー操作の追跡（保管期間: 7年）
        </p>
      </div>

      <AuditFilter
        users={allUsers}
        actions={distinctActions.map((a) => a.action)}
        entities={distinctEntities.map((e) => e.entityType)}
        current={{
          action: sp.action ?? "",
          entityType: sp.entityType ?? "",
          userId: sp.userId ?? "",
          from: sp.from ?? "",
          to: sp.to ?? "",
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>ログ一覧（{logs.length}件 / 上限{take}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">日時</TableHead>
                  <TableHead className="w-40">ユーザー</TableHead>
                  <TableHead className="w-28">アクション</TableHead>
                  <TableHead className="w-32">エンティティ</TableHead>
                  <TableHead className="w-40 font-mono text-xs">ID</TableHead>
                  <TableHead>変更内容</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      ログがありません
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-xs">
                        {format(new Date(l.createdAt), "yyyy/MM/dd HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-xs">
                        {l.user?.name}
                        <div className="text-muted-foreground">{l.user?.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">
                          {l.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{l.entityType}</TableCell>
                      <TableCell className="text-xs font-mono truncate max-w-40">
                        {l.entityId}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {l.changes ? (
                          <pre className="whitespace-pre-wrap break-all max-w-md">
                            {typeof l.changes === "string"
                              ? l.changes
                              : JSON.stringify(l.changes)}
                          </pre>
                        ) : (
                          "-"
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
