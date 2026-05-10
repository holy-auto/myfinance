"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createBudgetAction, copyPreviousMonthAction } from "./actions";

type Account = { id: string; code: string; name: string };
type BusinessUnit = { id: string; name: string };

export function BudgetForm({
  accounts,
  businessUnits,
  fiscalYear,
  fiscalMonth,
}: {
  accounts: Account[];
  businessUnits: BusinessUnit[];
  fiscalYear: number;
  fiscalMonth: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [businessUnitId, setBusinessUnitId] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("accountId", accountId);
    if (businessUnitId && businessUnitId !== "__none__") {
      formData.set("businessUnitId", businessUnitId);
    } else {
      formData.set("businessUnitId", "");
    }
    startTransition(async () => {
      try {
        await createBudgetAction(formData);
        toast.success("予算を登録しました");
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  function handleCopyPrev() {
    if (!confirm(`前月（${fiscalMonth === 1 ? fiscalYear - 1 : fiscalYear}/${fiscalMonth === 1 ? 12 : fiscalMonth - 1}）の予算をコピーしますか？`)) return;
    startTransition(async () => {
      try {
        const r = await copyPreviousMonthAction(fiscalYear, fiscalMonth);
        toast.success(`${r.copied}件コピーしました`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleCopyPrev} disabled={isPending}>
        前月コピー
      </Button>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        予算追加
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {fiscalYear}年{fiscalMonth}月 予算追加・更新
            </DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiscalYear">年度</Label>
                <Input id="fiscalYear" name="fiscalYear" type="number" defaultValue={fiscalYear} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiscalMonth">月</Label>
                <Input
                  id="fiscalMonth"
                  name="fiscalMonth"
                  type="number"
                  min={1}
                  max={12}
                  defaultValue={fiscalMonth}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>勘定科目 *</Label>
              <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="科目を選択" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>事業区分（任意）</Label>
              <Select value={businessUnitId} onValueChange={(v) => setBusinessUnitId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="（指定なし=全社）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">（全社）</SelectItem>
                  {businessUnits.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">予算金額 *</Label>
              <Input id="amount" name="amount" type="number" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">備考</Label>
              <Input id="description" name="description" />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending || !accountId}>
                {isPending ? "処理中..." : "登録/更新"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
