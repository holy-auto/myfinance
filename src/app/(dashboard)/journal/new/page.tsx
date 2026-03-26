"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createJournalAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

export default function NewJournalPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: "", debit: 0, credit: 0, description: "" },
    { accountId: "", debit: 0, credit: 0, description: "" },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  function addLine() {
    setLines([...lines, { accountId: "", debit: 0, credit: 0, description: "" }]);
  }

  function removeLine(index: number) {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  function updateLine(index: number, field: keyof JournalLine, value: string | number) {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createJournalAction({
          entryDate: formData.get("entryDate"),
          description: formData.get("description"),
          lines: lines.map((l) => ({
            accountId: l.accountId,
            debit: l.debit || 0,
            credit: l.credit || 0,
            description: l.description || undefined,
          })),
        });
        toast.success("仕訳を作成しました");
        router.push("/journal");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "作成に失敗しました"
        );
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">仕訳入力</h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>伝票ヘッダ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryDate">伝票日付 *</Label>
                <Input
                  id="entryDate"
                  name="entryDate"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">摘要 *</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="取引の内容を入力"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>仕訳明細</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="mr-1 h-4 w-4" />
              行追加
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>勘定科目ID</TableHead>
                  <TableHead className="w-32">借方</TableHead>
                  <TableHead className="w-32">貸方</TableHead>
                  <TableHead>摘要</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        placeholder="勘定科目ID"
                        value={line.accountId}
                        onChange={(e) =>
                          updateLine(index, "accountId", e.target.value)
                        }
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={line.debit || ""}
                        onChange={(e) =>
                          updateLine(index, "debit", parseFloat(e.target.value) || 0)
                        }
                        className="text-right font-mono"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={line.credit || ""}
                        onChange={(e) =>
                          updateLine(index, "credit", parseFloat(e.target.value) || 0)
                        }
                        className="text-right font-mono"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="摘要"
                        value={line.description}
                        onChange={(e) =>
                          updateLine(index, "description", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(index)}
                        disabled={lines.length <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end gap-8 text-sm">
              <div>
                借方合計:{" "}
                <span className="font-mono font-bold">
                  {totalDebit.toLocaleString()}
                </span>
              </div>
              <div>
                貸方合計:{" "}
                <span className="font-mono font-bold">
                  {totalCredit.toLocaleString()}
                </span>
              </div>
              <div
                className={
                  isBalanced ? "text-green-600" : "font-bold text-destructive"
                }
              >
                差額: {Math.abs(totalDebit - totalCredit).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending || !isBalanced}>
            {isPending ? "作成中..." : "下書き保存"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
