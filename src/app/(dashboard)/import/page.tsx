"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  previewImportAction,
  commitImportAction,
  type ImportPreview,
} from "./actions";

export default function ImportPage() {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isPending, startTransition] = useTransition();
  const [committing, setCommitting] = useState(false);

  function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!(fd.get("file") as File)?.name) {
      toast.error("ファイルを選択してください");
      return;
    }
    startTransition(async () => {
      try {
        const result = await previewImportAction(fd);
        setPreview(result);
        toast.success(`${result.validRows}件のプレビューを生成しました`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "プレビューに失敗しました");
      }
    });
  }

  async function handleCommit() {
    if (!preview || preview.preview.length === 0) return;
    setCommitting(true);
    try {
      const result = await commitImportAction(JSON.stringify(preview.preview));
      toast.success(`${result.created}件取込完了 / エラー${result.errors.length}件`);
      if (result.errors.length > 0) {
        console.error(result.errors);
      }
      setPreview(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "取込に失敗しました");
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">仕訳CSV取込</h1>
        <p className="text-sm text-muted-foreground">
          CSVファイルから仕訳をまとめて取り込みます
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. ファイル選択</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handlePreview} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">CSVファイル</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".csv,text/csv"
                required
              />
            </div>
            <Button type="submit" disabled={isPending}>
              <Upload className="mr-2 h-4 w-4" />
              {isPending ? "解析中..." : "プレビュー"}
            </Button>
          </form>
          <div className="rounded-md bg-muted p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">対応するCSV列名（いずれか）:</p>
            <p>日付 / 摘要 / 借方科目 / 借方金額 / 貸方科目 / 貸方金額 / 取引先(任意) / 税区分(任意)</p>
            <p>※借方科目・貸方科目は勘定科目コードで指定してください</p>
            <p>例:「日付,摘要,借方科目,借方金額,貸方科目,貸方金額」</p>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              2. プレビューと確定
              <Badge variant="default" className="ml-2">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                有効 {preview.validRows}件
              </Badge>
              {preview.errors.length > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  エラー {preview.errors.length}件
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview.errors.length > 0 && (
              <div className="rounded border border-destructive bg-destructive/5 p-3 text-xs">
                <p className="font-semibold mb-1">エラー一覧</p>
                <ul className="space-y-0.5">
                  {preview.errors.slice(0, 20).map((e, i) => (
                    <li key={i}>
                      行{e.row}: {e.message}
                    </li>
                  ))}
                  {preview.errors.length > 20 && (
                    <li>...他{preview.errors.length - 20}件</li>
                  )}
                </ul>
              </div>
            )}

            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12">行</TableHead>
                    <TableHead className="w-28">日付</TableHead>
                    <TableHead>摘要</TableHead>
                    <TableHead className="w-24">借方科目</TableHead>
                    <TableHead className="w-28 text-right">借方金額</TableHead>
                    <TableHead className="w-24">貸方科目</TableHead>
                    <TableHead className="w-28 text-right">貸方金額</TableHead>
                    <TableHead className="w-32">取引先</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.preview.slice(0, 200).map((line) => (
                    <TableRow key={line.rowNumber}>
                      <TableCell>{line.rowNumber}</TableCell>
                      <TableCell>{line.entryDate}</TableCell>
                      <TableCell className="max-w-xs truncate">{line.description}</TableCell>
                      <TableCell className="font-mono">{line.debitCode}</TableCell>
                      <TableCell className="text-right font-mono">
                        {line.debitAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">{line.creditCode}</TableCell>
                      <TableCell className="text-right font-mono">
                        {line.creditAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">{line.counterparty ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {preview.preview.length > 200 && (
                <div className="text-xs text-muted-foreground p-2 text-center">
                  プレビューは先頭200件のみ表示しています（取込は{preview.preview.length}件）
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCommit} disabled={committing || preview.validRows === 0}>
                {committing ? "取込中..." : `${preview.validRows}件を取り込む`}
              </Button>
              <Button variant="outline" onClick={() => setPreview(null)} disabled={committing}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
