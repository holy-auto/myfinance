export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CounterpartyForm } from "../counterparty-form";

export default async function EditCounterpartyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.counterparty.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">取引先 編集</h1>
      <CounterpartyForm
        initial={{
          id: item.id,
          code: item.code,
          name: item.name,
          nameKana: item.nameKana,
          kind: item.kind,
          registrationNo: item.registrationNo,
          email: item.email,
          phone: item.phone,
          address: item.address,
          bankInfo: item.bankInfo,
          paymentTerms: item.paymentTerms,
          notes: item.notes,
          isActive: item.isActive,
        }}
      />
    </div>
  );
}
