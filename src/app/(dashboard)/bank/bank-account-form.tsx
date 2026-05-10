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
import { createBankAccountAction } from "./actions";

type Account = { id: string; code: string; name: string };

export function BankAccountForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("SAVINGS");
  const [linkedId, setLinkedId] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("type", type);
    if (linkedId && linkedId !== "__none__") {
      formData.set("linkedAccountId", linkedId);
    } else {
      formData.set("linkedAccountId", "");
    }
    startTransition(async () => {
      try {
        await createBankAccountAction(formData);
        toast.success("口座を登録しました");
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        口座追加
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>口座を追加</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">コード *</Label>
              <Input id="code" name="code" required placeholder="BANK01" />
            </div>
            <div className="space-y-2">
              <Label>口座種別 *</Label>
              <Select value={type} onValueChange={(v) => setType(v ?? "SAVINGS")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">普通預金</SelectItem>
                  <SelectItem value="CHECKING">当座預金</SelectItem>
                  <SelectItem value="CREDIT_CARD">クレジットカード</SelectItem>
                  <SelectItem value="E_MONEY">電子マネー</SelectItem>
                  <SelectItem value="CASH">現金</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">名称 *</Label>
            <Input id="name" name="name" required placeholder="メインバンク" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">銀行名</Label>
              <Input id="bankName" name="bankName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchName">支店名</Label>
              <Input id="branchName" name="branchName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">口座番号</Label>
              <Input id="accountNumber" name="accountNumber" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openingBalance">期首残高</Label>
              <Input id="openingBalance" name="openingBalance" type="number" defaultValue={0} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>関連勘定科目（任意）</Label>
            <Select value={linkedId} onValueChange={(v) => setLinkedId(v ?? "")}>
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
          <input type="hidden" name="isActive" value="true" />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "処理中..." : "登録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
