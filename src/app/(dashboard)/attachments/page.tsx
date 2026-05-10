export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadForm } from "./upload-form";
import { AttachmentRowActions } from "./attachment-actions";

const OCR_LABELS: Record<string, string> = {
  PENDING: "未処理",
  PROCESSING: "処理中",
  COMPLETED: "完了",
  FAILED: "失敗",
};

const OCR_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  PROCESSING: "secondary",
  COMPLETED: "default",
  FAILED: "destructive",
};

const fileSizeKb = (n: number) => `${(n / 1024).toFixed(1)} KB`;

export default async function AttachmentsPage() {
  const attachments = await prisma.attachment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      uploadedBy: { select: { name: true } },
      journalEntries: {
        include: { journalEntry: { select: { entryNumber: true, id: true } } },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">証憑管理</h1>
        <p className="text-sm text-muted-foreground">
          請求書・領収書のメタデータ管理。インボイス制度・電子帳簿保存法に対応した検索性を提供
        </p>
      </div>

      <UploadForm />

      <Card>
        <CardHeader>
          <CardTitle>証憑一覧（直近100件）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ファイル名</TableHead>
                  <TableHead className="w-32">サイズ</TableHead>
                  <TableHead className="w-32">アップロード日</TableHead>
                  <TableHead className="w-24">アップロード者</TableHead>
                  <TableHead className="w-24">OCR</TableHead>
                  <TableHead>関連仕訳</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attachments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      証憑が登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  attachments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        {a.storageUrl ? (
                          <a
                            href={a.storageUrl}
                            target="_blank"
                            rel="noopener"
                            className="text-primary hover:underline"
                          >
                            {a.fileName}
                          </a>
                        ) : (
                          a.fileName
                        )}
                        <div className="text-xs text-muted-foreground">{a.mimeType}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{fileSizeKb(a.fileSize)}</TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(a.createdAt), "yyyy/MM/dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-xs">{a.uploadedBy.name}</TableCell>
                      <TableCell>
                        <Badge variant={OCR_VARIANT[a.ocrStatus]}>
                          {OCR_LABELS[a.ocrStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {a.journalEntries.length === 0 ? (
                          <span className="text-xs text-muted-foreground">-</span>
                        ) : (
                          <div className="space-y-0.5">
                            {a.journalEntries.map((ea) => (
                              <a
                                key={ea.attachmentId + ea.journalEntryId}
                                href={`/journal/${ea.journalEntry.id}`}
                                className="block text-xs text-primary hover:underline font-mono"
                              >
                                {ea.journalEntry.entryNumber}
                              </a>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <AttachmentRowActions id={a.id} ocrStatus={a.ocrStatus} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
