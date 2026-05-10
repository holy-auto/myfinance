export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ImportClient } from "./client";

export default async function BankImportPage() {
  const banks = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
    select: { id: true, code: true, name: true },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">銀行明細インポート</h1>
        <p className="text-sm text-muted-foreground">
          銀行・カードのCSV明細を取り込みます
        </p>
      </div>
      <ImportClient banks={banks} />
    </div>
  );
}
