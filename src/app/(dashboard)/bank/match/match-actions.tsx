"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  autoMatchAction,
  manualMatchAction,
  ignoreTransactionAction,
  unmatchTransactionAction,
} from "../actions";

type Bank = { id: string; code: string; name: string };

export function AutoMatchButton({ banks }: { banks: Bank[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const r = await autoMatchAction();
        toast.success(`${r.matched}件突合（対象${r.total}件）`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending || banks.length === 0}>
      {isPending ? "実行中..." : "自動突合を実行"}
    </Button>
  );
}

type Candidate = {
  id: string;
  entryNumber: string;
  description: string;
  entryDate: string;
  totalAmount: number;
};

export function MatchActions({
  txId,
  status,
  amount,
  txDate,
}: {
  txId: string;
  status: string;
  amount: number;
  txDate: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/v1/journal/candidates?amount=${amount}&date=${encodeURIComponent(txDate)}`)
      .then((r) => r.json())
      .then(setCandidates)
      .catch(() => setCandidates([]));
  }, [open, amount, txDate]);

  function pickCandidate(journalId: string) {
    startTransition(async () => {
      try {
        await manualMatchAction(txId, journalId);
        toast.success("突合しました");
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  function handleIgnore() {
    startTransition(async () => {
      try {
        await ignoreTransactionAction(txId);
        toast.success("対象外にしました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  function handleUnmatch() {
    startTransition(async () => {
      try {
        await unmatchTransactionAction(txId);
        toast.success("突合を解除しました");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  if (status === "MATCHED") {
    return (
      <Button size="sm" variant="ghost" onClick={handleUnmatch} disabled={isPending}>
        解除
      </Button>
    );
  }

  if (status === "IGNORED") {
    return (
      <Button size="sm" variant="ghost" onClick={handleUnmatch} disabled={isPending}>
        戻す
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        突合
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>突合する仕訳を選択</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                ±3日 / 同金額の候補が見つかりません
              </p>
            ) : (
              candidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickCandidate(c.id)}
                  disabled={isPending}
                  className="w-full text-left rounded border p-2 hover:bg-accent text-sm"
                >
                  <div className="flex justify-between">
                    <span className="font-mono">{c.entryNumber}</span>
                    <span className="font-mono">¥{c.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.entryDate.split("T")[0]} - {c.description}
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="ghost" onClick={handleIgnore} disabled={isPending}>
        対象外
      </Button>
    </div>
  );
}
