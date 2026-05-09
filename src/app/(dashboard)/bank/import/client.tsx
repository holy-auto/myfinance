"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { importBankCsvAction } from "../actions";

export function ImportClient({ banks }: { banks: { id: string; code: string; name: string }[] }) {
  const router = useRouter();
  const [bankId, setBankId] = useState(banks[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("bankAccountId", bankId);
    if (!bankId) {
      toast.error("口座を選択してください");
      return;
    }
    if (!(fd.get("file") as File)?.name) {
      toast.error("ファイルを選択してください");
      return;
    }
    startTransition(async () => {
      try {
        const result = await importBankCsvAction(fd);
        toast.success(`${result.imported}件取込 / エラー${result.errors.length}件`);
        if (result.errors.length > 0) {
          console.error(result.errors);
        }
        router.push("/bank");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>明細CSVを取り込む</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>取り込み先口座 *</Label>
            <Select value={bankId} onValueChange={(v) => setBankId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="口座を選択" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.code} {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">CSVファイル *</Label>
            <Input id="file" name="file" type="file" accept=".csv" required />
          </div>

          <div className="rounded bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-semibold">対応するCSV列名:</p>
            <p>日付 / 摘要 / 入金 / 出金 / 残高（任意）</p>
            <p>例: 「日付,摘要,入金,出金,残高」「取引日,内容,入金額,出金額」</p>
          </div>

          <Button type="submit" disabled={isPending || !bankId}>
            <Upload className="mr-2 h-4 w-4" />
            {isPending ? "取込中..." : "インポート実行"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
