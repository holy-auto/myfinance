"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  submitJournalAction,
  approveJournalAction,
  rejectJournalAction,
} from "./actions";

interface Props {
  entryId: string;
  status: string;
}

export function JournalActionButtons({ entryId, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  function handleSubmit() {
    startTransition(async () => {
      try {
        await submitJournalAction(entryId);
        toast.success("承認申請しました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "エラーが発生しました");
      }
    });
  }

  function handleApprove() {
    startTransition(async () => {
      try {
        await approveJournalAction(entryId);
        toast.success("承認しました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "エラーが発生しました");
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      try {
        await rejectJournalAction(entryId, rejectReason);
        toast.success("却下しました");
        setRejectOpen(false);
        setRejectReason("");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "エラーが発生しました");
      }
    });
  }

  if (status === "DRAFT") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleSubmit}
        disabled={isPending}
      >
        承認申請
      </Button>
    );
  }

  if (status === "PENDING_APPROVAL") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={handleApprove}
          disabled={isPending}
        >
          承認
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setRejectOpen(true)}
          disabled={isPending}
        >
          却下
        </Button>

        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>却下理由を入力</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="rejectReason">却下理由 *</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="却下理由を入力してください"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isPending || !rejectReason.trim()}
              >
                却下する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}
