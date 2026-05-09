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
import { InviteUserButton, UserRowActions } from "./user-actions";

export default async function UsersAdminPage() {
  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      include: { roles: { include: { role: { select: { id: true, name: true } } } } },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ユーザー管理</h1>
          <p className="text-sm text-muted-foreground">
            招待制 / 管理者承認必須 / 退職時即時無効化
          </p>
        </div>
        <InviteUserButton roles={roles} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧（{users.length}名）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名 / メール</TableHead>
                  <TableHead className="w-32">最終ログイン</TableHead>
                  <TableHead className="w-24">MFA</TableHead>
                  <TableHead className="w-24">状態</TableHead>
                  <TableHead className="min-w-72">ロール / 操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      ユーザーが登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {u.lastLoginAt
                          ? format(new Date(u.lastLoginAt), "yyyy/MM/dd HH:mm")
                          : "未ログイン"}
                      </TableCell>
                      <TableCell>
                        {u.mfaEnabled ? (
                          <Badge variant="default" className="text-xs">有効</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">未設定</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.isActive ? (
                          <Badge>有効</Badge>
                        ) : (
                          <Badge variant="secondary">無効</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <UserRowActions
                          userId={u.id}
                          isActive={u.isActive}
                          currentRoles={u.roles.map((ur) => ur.role)}
                          allRoles={roles}
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
