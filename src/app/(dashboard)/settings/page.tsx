export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import {
  Shield,
  KeyRound,
  Database,
  FileSearch,
  ScrollText,
  Building2,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
    include: { roles: { include: { role: true } } },
  });
  if (!user) redirect("/login");

  const [accountCount, journalCount, attachmentCount] = await Promise.all([
    prisma.account.count(),
    prisma.journalEntry.count(),
    prisma.attachment.count(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-sm text-muted-foreground">
          アカウント・コンプライアンス・データの確認
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              アカウント情報
            </CardTitle>
            <CardDescription>ログイン中のユーザー</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">氏名</div>
              <div className="font-medium">{user.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">メールアドレス</div>
              <div className="font-mono text-sm">{user.email}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">ロール</div>
              <div className="flex flex-wrap gap-1">
                {user.roles.map((ur) => (
                  <Badge key={ur.roleId} variant="outline">
                    {ur.role.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">最終ログイン</div>
              <div className="text-sm">
                {user.lastLoginAt ? format(new Date(user.lastLoginAt), "yyyy/MM/dd HH:mm") : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">MFA</div>
              <div>
                {user.mfaEnabled ? (
                  <Badge>有効</Badge>
                ) : (
                  <Badge variant="outline">未設定</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              データ概況
            </CardTitle>
            <CardDescription>登録済みデータの件数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>勘定科目</span>
              <span className="font-mono">{accountCount}件</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>仕訳伝票</span>
              <span className="font-mono">{journalCount}件</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>証憑</span>
              <span className="font-mono">{attachmentCount}件</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              セキュリティポリシー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>・招待制のみ。自己登録不可</p>
            <p>・退職時即時失効（セッション強制切断）</p>
            <p>・四半期ごとのアカウント棚卸し</p>
            <p>・操作ログ7年保管（追記専用）</p>
            <p>・通信時/保存時の暗号化</p>
            <p>・必須MFA（拡張対応）</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              法令対応
            </CardTitle>
            <CardDescription>インボイス制度・電子帳簿保存法</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>・取引日 / 金額 / 取引先 で検索可能（電帳法 検索性）</p>
            <p>・操作ログによる真実性の確保</p>
            <p>・OCR機能で見読性を担保</p>
            <p>・適格請求書発行事業者番号を取引先マスタに保管</p>
            <p>・税区分（8% / 10% / 軽減 / 非課税 / 不課税）対応</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              関連リンク
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/audit-logs">
              <Button variant="outline" className="w-full justify-start">
                <ScrollText className="mr-2 h-4 w-4" />
                自分の操作履歴
              </Button>
            </Link>
            <Link href="/closing">
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                月次締め履歴
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                管理画面（ADMIN権限）
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              システム情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">エディション</span>
              <span className="font-mono">MyFinance MVP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">アーキテクチャ</span>
              <span className="font-mono">Next.js 15 + Prisma + Postgres</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">タイムゾーン</span>
              <span className="font-mono">Asia/Tokyo</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
