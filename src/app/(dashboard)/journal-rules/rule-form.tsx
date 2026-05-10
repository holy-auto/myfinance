"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil } from "lucide-react";
import { createRuleAction, updateRuleAction, deleteRuleAction } from "./actions";

type Account = { id: string; code: string; name: string };
type Counterparty = { id: string; name: string };
type BusinessUnit = { id: string; name: string };

type Item = {
  id: string;
  name: string;
  priority: number;
  isActive: boolean;
  matchKeyword: string | null;
  matchAmountMin: { toString(): string } | null;
  matchAmountMax: { toString(): string } | null;
  counterpartyId: string | null;
  debitAccountId: string | null;
  creditAccountId: string | null;
  taxCategory: string | null;
  businessUnitId: string | null;
  description: string | null;
};

export function RuleForm({
  mode,
  item,
  accounts,
  counterparties,
  businessUnits,
}: {
  mode: "create" | "edit";
  item?: Item;
  accounts: Account[];
  counterparties: Counterparty[];
  businessUnits: BusinessUnit[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [debitId, setDebitId] = useState(item?.debitAccountId ?? "");
  const [creditId, setCreditId] = useState(item?.creditAccountId ?? "");
  const [counterpartyId, setCounterpartyId] = useState(item?.counterpartyId ?? "");
  const [businessUnitId, setBusinessUnitId] = useState(item?.businessUnitId ?? "");

  function handleSubmit(formData: FormData) {
    const norm = (v: string) => (v && v !== "__none__" ? v : "");
    formData.set("debitAccountId", norm(debitId));
    formData.set("creditAccountId", norm(creditId));
    formData.set("counterpartyId", norm(counterpartyId));
    formData.set("businessUnitId", norm(businessUnitId));

    startTransition(async () => {
      try {
        if (mode === "edit" && item) {
          await updateRuleAction(item.id, formData);
          toast.success("更新しました");
        } else {
          await createRuleAction(formData);
          toast.success("登録しました");
        }
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  function handleDelete() {
    if (!item) return;
    if (!confirm(`ルール「${item.name}」を削除しますか？`)) return;
    startTransition(async () => {
      try {
        await deleteRuleAction(item.id);
        toast.success("削除しました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={mode === "edit" ? "outline" : "default"}
        size={mode === "edit" ? "sm" : "default"}
        onClick={() => setOpen(true)}
      >
        {mode === "edit" ? <Pencil className="h-4 w-4" /> : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            ルール追加
          </>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "自動仕訳ルール 編集" : "自動仕訳ルール 追加"}
            </DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">ルール名 *</Label>
                <Input id="name" name="name" required defaultValue={item?.name} placeholder="家賃支払い → 地代家賃" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">優先度（小さいほど先）</Label>
                <Input
                  id="priority"
                  name="priority"
                  type="number"
                  min={1}
                  max={9999}
                  defaultValue={item?.priority ?? 100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxCategory">税区分（任意）</Label>
                <Input
                  id="taxCategory"
                  name="taxCategory"
                  defaultValue={item?.taxCategory ?? ""}
                  placeholder="課税仕入10%"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">マッチ条件</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="matchKeyword" className="text-xs">摘要キーワード</Label>
                  <Input
                    id="matchKeyword"
                    name="matchKeyword"
                    placeholder="部分一致（例: 家賃）"
                    defaultValue={item?.matchKeyword ?? ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="matchAmountMin" className="text-xs">金額範囲(下限)</Label>
                  <Input
                    id="matchAmountMin"
                    name="matchAmountMin"
                    type="number"
                    defaultValue={item?.matchAmountMin?.toString() ?? ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="matchAmountMax" className="text-xs">金額範囲(上限)</Label>
                  <Input
                    id="matchAmountMax"
                    name="matchAmountMax"
                    type="number"
                    defaultValue={item?.matchAmountMax?.toString() ?? ""}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">取引先</Label>
                  <Select value={counterpartyId} onValueChange={(v) => setCounterpartyId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">（指定なし）</SelectItem>
                      {counterparties.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">適用する仕訳</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">借方科目</Label>
                  <Select value={debitId} onValueChange={(v) => setDebitId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="科目を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">（指定なし）</SelectItem>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.code} {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">貸方科目</Label>
                  <Select value={creditId} onValueChange={(v) => setCreditId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="科目を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">（指定なし）</SelectItem>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.code} {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">事業区分（任意）</Label>
                  <Select value={businessUnitId} onValueChange={(v) => setBusinessUnitId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">（指定なし）</SelectItem>
                      {businessUnits.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明（任意）</Label>
              <Textarea id="description" name="description" rows={2} defaultValue={item?.description ?? ""} />
            </div>

            <input
              type="hidden"
              name="isActive"
              value={item?.isActive === false ? "false" : "true"}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "処理中..." : mode === "edit" ? "更新" : "登録"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {mode === "edit" && item && (
        <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
          削除
        </Button>
      )}
    </div>
  );
}
