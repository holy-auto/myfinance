import { CounterpartyForm } from "../counterparty-form";

export default function NewCounterpartyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">取引先 新規登録</h1>
      <CounterpartyForm />
    </div>
  );
}
