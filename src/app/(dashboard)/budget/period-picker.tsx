"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function PeriodPicker({ year, month }: { year: number; month: number }) {
  const router = useRouter();
  const [y, setY] = useState(year);
  const [m, setM] = useState(month);

  function jump() {
    router.push(`/budget?year=${y}&month=${m}`);
  }

  return (
    <div className="flex items-end gap-4">
      <div className="space-y-1">
        <Label htmlFor="year">年</Label>
        <Input
          id="year"
          type="number"
          value={y}
          onChange={(e) => setY(parseInt(e.target.value, 10) || year)}
          className="w-28"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="month">月</Label>
        <Input
          id="month"
          type="number"
          min={1}
          max={12}
          value={m}
          onChange={(e) => setM(parseInt(e.target.value, 10) || month)}
          className="w-24"
        />
      </div>
      <Button onClick={jump}>表示</Button>
    </div>
  );
}
