"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { closePeriodAction, reopenPeriodAction } from "./actions";

interface Props {
  fiscalYear: number;
  fiscalMonth: number;
  status: string;
}

export function ClosingButtons({ fiscalYear, fiscalMonth, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    startTransition(async () => {
      try {
        await closePeriodAction(fiscalYear, fiscalMonth);
        toast.success(`${fiscalYear}年${fiscalMonth}月を締めました`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "エラーが発生しました");
      }
    });
  }

  function handleReopen() {
    startTransition(async () => {
      try {
        await reopenPeriodAction(fiscalYear, fiscalMonth);
        toast.success(`${fiscalYear}年${fiscalMonth}月の締めを解除しました`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "エラーが発生しました");
      }
    });
  }

  if (status === "CLOSED") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleReopen}
        disabled={isPending}
      >
        締め解除
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="default"
      onClick={handleClose}
      disabled={isPending}
    >
      締める
    </Button>
  );
}
