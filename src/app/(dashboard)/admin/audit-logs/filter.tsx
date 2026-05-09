"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AuditFilter({
  users,
  actions,
  entities,
  current,
}: {
  users: { id: string; name: string }[];
  actions: string[];
  entities: string[];
  current: {
    action: string;
    entityType: string;
    userId: string;
    from: string;
    to: string;
  };
}) {
  const router = useRouter();
  const [action, setAction] = useState(current.action);
  const [entityType, setEntityType] = useState(current.entityType);
  const [userId, setUserId] = useState(current.userId);
  const [from, setFrom] = useState(current.from);
  const [to, setTo] = useState(current.to);

  function apply() {
    const params = new URLSearchParams();
    if (action && action !== "__all__") params.set("action", action);
    if (entityType && entityType !== "__all__") params.set("entityType", entityType);
    if (userId && userId !== "__all__") params.set("userId", userId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/admin/audit-logs?${params.toString()}`);
  }

  function reset() {
    router.push("/admin/audit-logs");
  }

  const onChange = (set: (v: string) => void) => (v: string | null) => set(v ?? "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>フィルター</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-xs">アクション</Label>
            <Select value={action || "__all__"} onValueChange={onChange(setAction)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">すべて</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">エンティティ</Label>
            <Select value={entityType || "__all__"} onValueChange={onChange(setEntityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">すべて</SelectItem>
                {entities.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">ユーザー</Label>
            <Select value={userId || "__all__"} onValueChange={onChange(setUserId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">すべて</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">開始日</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">終了日</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={apply}>絞り込む</Button>
          <Button variant="outline" onClick={reset}>
            リセット
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
