"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CashFlowPicker({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);
  return (
    <div className="flex items-end gap-3">
      <div className="space-y-1">
        <Label>開始日</Label>
        <Input type="date" value={f} onChange={(e) => setF(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>終了日</Label>
        <Input type="date" value={t} onChange={(e) => setT(e.target.value)} />
      </div>
      <Button onClick={() => router.push(`/reports/cash-flow?from=${f}&to=${t}`)}>表示</Button>
    </div>
  );
}
