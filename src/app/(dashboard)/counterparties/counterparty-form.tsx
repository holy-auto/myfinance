"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCounterpartyAction,
  updateCounterpartyAction,
} from "./actions";

type Initial = {
  id?: string;
  code?: string;
  name?: string;
  nameKana?: string | null;
  kind?: string;
  registrationNo?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  bankInfo?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  isActive?: boolean;
};

export function CounterpartyForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!initial?.id;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateCounterpartyAction(initial!.id!, formData);
          toast.success("取引先を更新しました");
        } else {
          await createCounterpartyAction(formData);
          toast.success("取引先を登録しました");
        }
        router.push("/counterparties");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "保存に失敗しました");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>取引先情報</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">コード *</Label>
              <Input id="code" name="code" required defaultValue={initial?.code ?? ""} placeholder="C0001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kind">区分 *</Label>
              <Select name="kind" defaultValue={initial?.kind ?? "BOTH"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">得意先</SelectItem>
                  <SelectItem value="VENDOR">仕入先</SelectItem>
                  <SelectItem value="BOTH">得意先・仕入先</SelectItem>
                  <SelectItem value="OTHER">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">取引先名 *</Label>
              <Input id="name" name="name" required defaultValue={initial?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameKana">フリガナ</Label>
              <Input id="nameKana" name="nameKana" defaultValue={initial?.nameKana ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNo">適格請求書発行事業者登録番号</Label>
              <Input
                id="registrationNo"
                name="registrationNo"
                placeholder="T1234567890123"
                defaultValue={initial?.registrationNo ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">支払条件</Label>
              <Input
                id="paymentTerms"
                name="paymentTerms"
                placeholder="月末締め翌月末払い"
                defaultValue={initial?.paymentTerms ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">メール</Label>
              <Input id="email" name="email" type="email" defaultValue={initial?.email ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">住所</Label>
            <Input id="address" name="address" defaultValue={initial?.address ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankInfo">振込先（銀行・支店・口座）</Label>
            <Input id="bankInfo" name="bankInfo" defaultValue={initial?.bankInfo ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ""} />
          </div>

          <input
            type="hidden"
            name="isActive"
            value={initial?.isActive === false ? "false" : "true"}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : isEdit ? "更新" : "登録"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
