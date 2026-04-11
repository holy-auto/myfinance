"use client";

import { useState } from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import {
  serviceCategories,
  menus,
  interiorVehicleTypes,
  seatRanges,
  interiorPriceMatrix,
  b2bServices,
  type ServiceCategory,
} from "../data";
import { cn } from "@/lib/utils";

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export function Services() {
  const [active, setActive] = useState<ServiceCategory>("wash");

  const categoryMenus = menus.filter((m) => m.category === active);

  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
      <SectionHeader
        eyebrow="Services"
        title="施術メニュー"
        description="日常の手洗い洗車から、長期保護の本格コーティングまで。塗装状態・ご予算に合わせてご提案します。"
      />

      {/* Category tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {serviceCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
              active === cat.id
                ? "border-sky-500 bg-sky-500 text-white shadow"
                : "border-slate-200 bg-white text-slate-700 hover:border-sky-300",
            )}
          >
            <span aria-hidden>{cat.icon}</span>
            {cat.short}
          </button>
        ))}
      </div>

      {/* Category content */}
      <div className="mt-8">
        {/* B2B is special */}
        {active === "b2b" ? (
          <B2BPanel />
        ) : active === "interior" ? (
          <InteriorPanel />
        ) : (
          <MenuGrid menus={categoryMenus} />
        )}
      </div>

      <p className="mt-6 text-xs text-slate-500">
        ※汚れ・車両状態・素材により金額が変動する場合があります。事前の問診（無料カウンセリング）にてすり合わせいたします。
      </p>
    </section>
  );
}

function MenuGrid({ menus: items }: { menus: typeof menus }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => (
        <div
          key={m.id}
          className={cn(
            "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
            m.popular ? "border-sky-400 ring-2 ring-sky-200" : "border-slate-200",
          )}
        >
          {m.popular && (
            <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-1 text-xs font-semibold text-white shadow">
              おすすめ
            </span>
          )}
          <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
          {m.duration !== "応相談" && (
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {m.duration}
            </div>
          )}
          <p className="mt-3 text-sm text-slate-600">{m.description}</p>

          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{m.priceLabel}</div>
          </div>

          <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
            {m.includes.map((x) => (
              <li key={x} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <span>{x}</span>
              </li>
            ))}
          </ul>

          {m.notes && m.notes.length > 0 && (
            <ul className="mt-3 space-y-0.5">
              {m.notes.map((n) => (
                <li key={n} className="flex items-start gap-1 text-xs text-slate-500">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  {n}
                </li>
              ))}
            </ul>
          )}

          <a
            href="#booking"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-900 transition-colors hover:border-sky-400 hover:text-sky-700"
          >
            無料カウンセリングを予約
          </a>
        </div>
      ))}
    </div>
  );
}

function InteriorPanel() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          シート/内装コーティング 料金表
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          ファブリック・レザーどちらも対応。車種と施工範囲でお選びください。
        </p>

        {/* Price matrix table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 pr-4 text-left text-slate-600 font-medium">車種</th>
                {seatRanges.map((r) => (
                  <th key={r.id} className="py-2 px-3 text-right text-slate-600 font-medium whitespace-nowrap">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {interiorVehicleTypes.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-slate-900 whitespace-nowrap">{v.label}</td>
                  {seatRanges.map((r) => (
                    <td key={r.id} className="py-3 px-3 text-right font-mono text-slate-900 whitespace-nowrap">
                      {yen(interiorPriceMatrix[v.id][r.id])}〜
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interior menu for booking */}
        {menus
          .filter((m) => m.category === "interior")
          .map((m) => (
            <div key={m.id} className="mt-4">
              <ul className="mt-2 space-y-1 text-xs text-slate-500">
                {m.notes?.map((n) => (
                  <li key={n} className="flex items-start gap-1">
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      {/* Addons note */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">追加オプション</h3>
        <p className="mt-1 text-xs text-slate-500">
          ※料金シミュレーターでオプション込みのお見積りができます。
        </p>
        <a
          href="#simulator"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-5 text-sm font-semibold text-white shadow transition-transform hover:scale-[1.02]"
        >
          料金シミュレーターで試算する
        </a>
      </div>
    </div>
  );
}

function B2BPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          ※業務提携事例あり
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900">業者様向けご依頼</h3>
        <p className="mt-2 text-sm text-slate-600">
          ディーラー・中古車販売店・整備工場など、法人・業者様からのご依頼も承っています。
          お気軽にお問い合わせください。
        </p>
        <ul className="mt-5 space-y-2">
          {b2bServices.map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm text-slate-800">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
        <p className="text-lg font-bold text-slate-900">
          「選ばれるお車に仕上げるがモットーです!!」
        </p>
        <p className="mt-3 text-sm text-slate-600">
          技術講習から量販施工まで、ご相談内容に応じて柔軟に対応いたします。
          まずはお電話またはInstagram DMにてお気軽にご連絡ください。
        </p>
        <a
          href="#booking"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-5 text-sm font-semibold text-white shadow transition-transform hover:scale-[1.02]"
        >
          業者向けお問い合わせ
        </a>
      </div>
    </div>
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
