"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function YearPicker({ year }: { year: number }) {
  const router = useRouter();
  const [y, setY] = useState(year);
  return (
    <div className="flex items-end gap-3">
      <Input
        type="number"
        value={y}
        onChange={(e) => setY(parseInt(e.target.value, 10) || year)}
        className="w-32"
      />
      <Button onClick={() => router.push(`/reports/budget-actual?year=${y}`)}>表示</Button>
    </div>
  );
}
