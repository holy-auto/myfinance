"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createAccount } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewAccountPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createAccount(formData);
        toast.success("勘定科目を作成しました");
        router.push("/accounts");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "作成に失敗しました"
        );
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">勘定科目 新規作成</h1>

      <Card>
        <CardHeader>
          <CardTitle>科目情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">勘定科目コード *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="1100"
                  required
                  pattern="\d+"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">科目名 *</Label>
                <Input id="name" name="name" placeholder="現金" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">科目区分 *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSET">資産</SelectItem>
                    <SelectItem value="LIABILITY">負債</SelectItem>
                    <SelectItem value="EQUITY">純資産</SelectItem>
                    <SelectItem value="REVENUE">収益</SelectItem>
                    <SelectItem value="EXPENSE">費用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="normalBalance">正常残高 *</Label>
                <Select name="normalBalance" required>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBIT">借方</SelectItem>
                    <SelectItem value="CREDIT">貸方</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameEn">英語名（任意）</Label>
              <Input id="nameEn" name="nameEn" placeholder="Cash" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明（任意）</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>

            <input type="hidden" name="isSummary" value="false" />

            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? "作成中..." : "作成"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
