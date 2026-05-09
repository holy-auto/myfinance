export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, ScrollText } from "lucide-react";

export default async function AdminPage() {
  const [userCount, roleCount, auditCount] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.auditLog.count(),
  ]);

  const links = [
    {
      href: "/admin/users",
      title: "ユーザー管理",
      desc: "招待・有効化・パスワードリセット",
      icon: Users,
      count: userCount,
    },
    {
      href: "/admin/roles",
      title: "ロール管理",
      desc: "権限定義の確認とユーザーへの割当",
      icon: Shield,
      count: roleCount,
    },
    {
      href: "/admin/audit-logs",
      title: "監査ログ",
      desc: "全操作の追跡（7年保管）",
      icon: ScrollText,
      count: auditCount,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">管理</h1>
        <p className="text-sm text-muted-foreground">
          ユーザー・ロール・監査ログ
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {l.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{l.count}</div>
                  <p className="text-xs text-muted-foreground mt-1">{l.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
