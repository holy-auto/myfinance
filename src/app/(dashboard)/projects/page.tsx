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
import { ProjectClient } from "./client";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">プロジェクト管理</h1>
          <p className="text-sm text-muted-foreground">
            案件単位での収支集計と原価管理に利用
          </p>
        </div>
        <ProjectClient mode="create" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>プロジェクト一覧（{projects.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">コード</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead className="w-32">開始日</TableHead>
                  <TableHead className="w-32">終了日</TableHead>
                  <TableHead className="w-24">状態</TableHead>
                  <TableHead className="w-40">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      プロジェクトが登録されていません
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {p.startDate ? format(new Date(p.startDate), "yyyy/MM/dd") : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {p.endDate ? format(new Date(p.endDate), "yyyy/MM/dd") : "-"}
                      </TableCell>
                      <TableCell>
                        {p.isActive ? (
                          <Badge>有効</Badge>
                        ) : (
                          <Badge variant="secondary">無効</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <ProjectClient
                          mode="edit"
                          item={{
                            id: p.id,
                            code: p.code,
                            name: p.name,
                            startDate: p.startDate,
                            endDate: p.endDate,
                            isActive: p.isActive,
                          }}
                        />
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
