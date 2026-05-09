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
  createDepartmentAction,
  updateDepartmentAction,
  toggleDepartmentAction,
} from "./actions";

type Item = { id: string; code: string; name: string; isActive: boolean };

export function DepartmentClient({
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
          await updateDepartmentAction(item.id, formData);
          toast.success("更新しました");
        } else {
          await createDepartmentAction(formData);
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
        await toggleDepartmentAction(item.id, !item.isActive);
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
            <DialogTitle>{mode === "edit" ? "部門を編集" : "部門を追加"}</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">部門コード *</Label>
              <Input id="code" name="code" required defaultValue={item?.code} placeholder="D001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">部門名 *</Label>
              <Input id="name" name="name" required defaultValue={item?.name} placeholder="経理部" />
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
