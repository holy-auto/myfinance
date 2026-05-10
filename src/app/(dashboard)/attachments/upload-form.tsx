"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAttachmentAction } from "./actions";

export function UploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [mimeType, setMimeType] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setFileSize(f.size);
    setMimeType(f.type);
  }

  function handleSubmit(formData: FormData) {
    if (!fileName) {
      toast.error("ファイルを選択してください");
      return;
    }
    formData.set("fileName", fileName);
    formData.set("fileSize", String(fileSize));
    formData.set("mimeType", mimeType);
    startTransition(async () => {
      try {
        await registerAttachmentAction(formData);
        toast.success("証憑を登録しました");
        router.refresh();
        setFileName("");
        setFileSize(0);
        setMimeType("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "失敗しました");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>証憑アップロード</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file">ファイル選択 *</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                required
              />
              {fileName && (
                <div className="text-xs text-muted-foreground">
                  {fileName} ({(fileSize / 1024).toFixed(1)}KB / {mimeType})
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="storageUrl">保管URL（任意）</Label>
              <Input
                id="storageUrl"
                name="storageUrl"
                placeholder="https://s3.example.com/..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="journalEntryId">関連付ける仕訳ID（任意）</Label>
            <Input id="journalEntryId" name="journalEntryId" placeholder="後から関連付けも可能" />
          </div>
          <div className="rounded bg-muted p-3 text-xs text-muted-foreground">
            ※ 本MVPでは実ファイルのS3アップロードは行わず、メタデータと外部URLのみ保管します（電子帳簿保存法対応の検索要件は満たします）
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "登録中..." : "証憑を登録"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
