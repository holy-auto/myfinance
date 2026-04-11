import { Check, Clock } from "lucide-react";
import { menus } from "../data";
import { cn } from "@/lib/utils";

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
      <SectionHeader
        eyebrow="Services"
        title="メニュー"
        description="日常ケアの手洗い洗車から、新車同等に戻すフルディテーリングまで。目的に合わせて選べる4プラン。"
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {menus.map((m) => (
          <div
            key={m.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
              m.popular ? "border-sky-400 ring-2 ring-sky-200" : "border-slate-200",
            )}
          >
            {m.popular && (
              <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-1 text-xs font-semibold text-white shadow">
                人気 No.1
              </span>
            )}
            <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {m.duration}
            </div>
            <p className="mt-3 text-sm text-slate-600">{m.description}</p>

            <div className="mt-5">
              <div className="text-xs text-slate-500">コンパクトカー基準</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{yen(m.basePrice)}</span>
                <span className="text-xs text-slate-500">〜</span>
              </div>
            </div>

            <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
              {m.includes.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>

            <a
              href={`#simulator`}
              data-menu={m.id}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-900 transition-colors hover:border-sky-400 hover:text-sky-700"
            >
              料金を見積もる
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-semibold tracking-widest text-sky-600 uppercase">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base text-slate-600">{description}</p>
      )}
    </div>
  );
}
