"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { simulateOcrAction, deleteAttachmentAction } from "./actions";

export function AttachmentRowActions({ id, ocrStatus }: { id: string; ocrStatus: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleOcr() {
    startTransition(async () => {
      try {
        await simulateOcrAction(id);
        toast.success("OCR処理を実行しました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  function handleDelete() {
    if (!confirm("この証憑を削除しますか？")) return;
    startTransition(async () => {
      try {
        await deleteAttachmentAction(id);
        toast.success("削除しました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  return (
    <div className="flex gap-1">
      {ocrStatus !== "COMPLETED" && (
        <Button size="sm" variant="outline" onClick={handleOcr} disabled={isPending}>
          OCR実行
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isPending}>
        削除
      </Button>
    </div>
  );
}
