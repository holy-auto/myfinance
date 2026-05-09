"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  inviteUserAction,
  toggleUserActive,
  assignRoleAction,
  removeRoleAction,
  resetPasswordAction,
} from "./actions";

type Role = { id: string; name: string };

export function InviteUserButton({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (roleId) formData.set("roleId", roleId);
    startTransition(async () => {
      try {
        await inviteUserAction(formData);
        toast.success("ユーザーを招待しました");
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
        ユーザー招待
      </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ユーザーを招待</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス *</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">氏名 *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">初期パスワード *（8文字以上）</Label>
            <Input id="password" name="password" type="text" minLength={8} required />
          </div>
          <div className="space-y-2">
            <Label>初期ロール</Label>
            <Select value={roleId} onValueChange={(v) => setRoleId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "処理中..." : "招待"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export function UserRowActions({
  userId,
  isActive,
  currentRoles,
  allRoles,
}: {
  userId: string;
  isActive: boolean;
  currentRoles: { id: string; name: string }[];
  allRoles: Role[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  function handleToggleActive() {
    startTransition(async () => {
      try {
        await toggleUserActive(userId, !isActive);
        toast.success(isActive ? "無効化しました" : "有効化しました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  function handleAssign(roleId: string) {
    startTransition(async () => {
      try {
        await assignRoleAction(userId, roleId);
        toast.success("ロールを付与しました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  function handleRemove(roleId: string) {
    startTransition(async () => {
      try {
        await removeRoleAction(userId, roleId);
        toast.success("ロールを外しました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  function handleResetPassword() {
    if (newPassword.length < 8) {
      toast.error("8文字以上で設定してください");
      return;
    }
    startTransition(async () => {
      try {
        await resetPasswordAction(userId, newPassword);
        toast.success("パスワードをリセットしました");
        setResetting(false);
        setNewPassword("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  const currentRoleIds = new Set(currentRoles.map((r) => r.id));
  const availableRoles = allRoles.filter((r) => !currentRoleIds.has(r.id));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 items-center">
        {currentRoles.map((r) => (
          <Badge
            key={r.id}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleRemove(r.id)}
            title="クリックで削除"
          >
            {r.name} ×
          </Badge>
        ))}
        {availableRoles.length > 0 && (
          <Select onValueChange={(v: string | null) => { if (v) handleAssign(v); }}>
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue placeholder="+ ロール" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleActive}
          disabled={isPending}
        >
          {isActive ? "無効化" : "有効化"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setResetting(true)}>
          PWリセット
        </Button>
        <Dialog open={resetting} onOpenChange={setResetting}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>パスワードリセット</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>新パスワード（8文字以上）</Label>
              <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={handleResetPassword} disabled={isPending}>
                リセット
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
