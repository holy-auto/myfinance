"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { closePeriodAction } from "./actions";

export function NewPeriodForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await closePeriodAction(year, month);
        toast.success(`${year}年${month}月を締めました`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "エラーが発生しました");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>月次締め実行</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-4 flex-wrap">
          <div className="space-y-2">
            <Label htmlFor="fy">会計年度</Label>
            <Input
              id="fy"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-28"
              min="2000"
              max="2100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fm">月</Label>
            <Input
              id="fm"
              type="number"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-20"
              min="1"
              max="12"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "処理中..." : "締める"}
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          ※ 締め済み期間への仕訳登録はブロックされます。必要な場合は「締め解除」してください。
        </p>
      </CardContent>
    </Card>
  );
}
