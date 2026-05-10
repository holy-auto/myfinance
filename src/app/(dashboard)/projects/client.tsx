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
import { Plus, Pencil } from "lucide-react";
import {
  createProjectAction,
  updateProjectAction,
  toggleProjectAction,
} from "./actions";

type Item = {
  id: string;
  code: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
};

const fmt = (d: Date | null) => (d ? new Date(d).toISOString().split("T")[0] : "");

export function ProjectClient({
  mode,
  item,
}: {
  mode: "create" | "edit";
  item?: Item;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (mode === "edit" && item) {
          await updateProjectAction(item.id, formData);
          toast.success("更新しました");
        } else {
          await createProjectAction(formData);
          toast.success("登録しました");
        }
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  function handleToggle() {
    if (!item) return;
    startTransition(async () => {
      try {
        await toggleProjectAction(item.id, !item.isActive);
        toast.success(item.isActive ? "無効化しました" : "有効化しました");
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
            新規登録
          </>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "プロジェクトを編集" : "プロジェクトを追加"}
            </DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">プロジェクトコード *</Label>
              <Input id="code" name="code" required defaultValue={item?.code} placeholder="P001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">プロジェクト名 *</Label>
              <Input id="name" name="name" required defaultValue={item?.name} placeholder="新規受注獲得" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">開始日</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue={fmt(item?.startDate ?? null)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">終了日</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={fmt(item?.endDate ?? null)} />
              </div>
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
        <Button variant="ghost" size="sm" onClick={handleToggle} disabled={isPending}>
          {item.isActive ? "無効化" : "有効化"}
        </Button>
      )}
    </div>
  );
}
