"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import {
  serviceCategories,
  menus,
  interiorVehicleTypes,
  seatRanges,
  interiorPriceMatrix,
  interiorAddons,
  type ServiceCategory,
  type InteriorVehicleType,
  type SeatRange,
  type InteriorAddonId,
  type MenuId,
} from "../data";
import { SectionHeader } from "./services";
import { cn } from "@/lib/utils";

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;
// Exclude b2b from simulator tabs
const simCategories = serviceCategories.filter((c) => c.id !== "b2b");

export function PricingSimulator() {
  const [category, setCategory] = useState<ServiceCategory>("interior");

  return (
    <section
      id="simulator"
      className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50 to-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Pricing"
          title="料金シミュレーター"
          description="カテゴリーと施工内容を選ぶだけで、今すぐお見積りを確認できます。"
        />

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {simCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
                category === cat.id
                  ? "border-sky-500 bg-sky-500 text-white shadow"
                  : "border-slate-200 bg-white text-slate-700 hover:border-sky-300",
              )}
            >
              <span aria-hidden>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {category === "interior" ? (
            <InteriorSimulator />
          ) : (
            <SimpleSimulator category={category} />
          )}
        </div>
      </div>
    </section>
  );
}

/** 洗車・ボディ・ガラス・ホイール用シンプルシミュレーター */
function SimpleSimulator({ category }: { category: ServiceCategory }) {
  const categoryMenus = menus.filter((m) => m.category === category);
  const [menuId, setMenuId] = useState<MenuId>(categoryMenus[0]?.id ?? "wash-full");

  const selected = useMemo(
    () => menus.find((m) => m.id === menuId) ?? categoryMenus[0],
    [menuId, categoryMenus],
  );

  const goToBooking = () => {
    window.dispatchEvent(
      new CustomEvent("carwash:prefill-booking", {
        detail: { menuId, category },
      }),
    );
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!selected) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-sm font-semibold text-slate-900 mb-3">メニューを選択</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {categoryMenus.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMenuId(m.id)}
              className={cn(
                "flex items-start justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                menuId === m.id
                  ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                  : "border-slate-200 hover:border-sky-300",
              )}
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">{m.name}</div>
                {m.duration !== "応相談" && (
                  <div className="text-[11px] text-slate-500">{m.duration}</div>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900 whitespace-nowrap ml-2">
                {m.priceLabel}
              </div>
            </button>
          ))}
        </div>
      </div>

      <SummaryCard
        rows={[
          { label: "施術", value: selected.name },
          { label: "料金", value: selected.priceLabel },
          { label: "所要時間", value: selected.duration },
        ]}
        note="※最終料金は車両状態・サイズにより変動します。事前の無料カウンセリングにてご確認ください。"
        onBook={goToBooking}
      />
    </div>
  );
}

/** シート/内装コーティング専用シミュレーター（マトリクス料金） */
function InteriorSimulator() {
  const [vehicleType, setVehicleType] = useState<InteriorVehicleType>("small");
  const [seatRange, setSeatRange] = useState<SeatRange>("driverPassenger");
  const [addons, setAddons] = useState<Set<InteriorAddonId>>(new Set());

  const basePrice = interiorPriceMatrix[vehicleType][seatRange];
  const addonTotal = interiorAddons
    .filter((a) => addons.has(a.id))
    .reduce((s, a) => s + a.price, 0);
  const total = basePrice + addonTotal;

  const vehicleLabel = interiorVehicleTypes.find((v) => v.id === vehicleType)?.label ?? "";
  const seatLabel = seatRanges.find((r) => r.id === seatRange)?.label ?? "";

  const toggleAddon = (id: InteriorAddonId) => {
    setAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goToBooking = () => {
    window.dispatchEvent(
      new CustomEvent("carwash:prefill-booking", {
        detail: { menuId: "interior", category: "interior" },
      }),
    );
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Vehicle type */}
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-3">1. 車種</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {interiorVehicleTypes.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVehicleType(v.id)}
                className={cn(
                  "flex items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                  vehicleType === v.id
                    ? "border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-200"
                    : "border-slate-200 hover:border-sky-300",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seat range */}
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-3">2. 施工範囲</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {seatRanges.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSeatRange(r.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors",
                  seatRange === r.id
                    ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                    : "border-slate-200 hover:border-sky-300",
                )}
              >
                <span className="text-sm font-medium text-slate-900">{r.label}</span>
                <span className="text-sm font-bold text-slate-900">
                  {yen(interiorPriceMatrix[vehicleType][r.id])}〜
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Addons */}
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-3">3. 追加オプション（任意）</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {interiorAddons.map((a) => {
              const active = addons.has(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAddon(a.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                      : "border-slate-200 hover:border-sky-300",
                  )}
                >
                  <div>
                    <span className={cn("inline-flex h-4 w-4 items-center justify-center rounded border mr-2 align-middle",
                      active ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300 bg-white"
                    )}>
                      {active && <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current"><path d="M7.6 13.3 4.3 10l-1.1 1.1 4.4 4.4 9.2-9.2-1.1-1.1z"/></svg>}
                    </span>
                    <span className="text-sm font-medium text-slate-900">{a.label}</span>
                    {a.note && <span className="ml-1 text-xs text-slate-500">({a.note})</span>}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 whitespace-nowrap ml-2">+{yen(a.price)}〜</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <SummaryCard
        rows={[
          { label: "車種",   value: vehicleLabel },
          { label: "範囲",   value: seatLabel },
          { label: "基本料金", value: `${yen(basePrice)}〜` },
          ...interiorAddons
            .filter((a) => addons.has(a.id))
            .map((a) => ({ label: a.label, value: `+${yen(a.price)}〜`, muted: true })),
        ]}
        total={`${yen(total)}〜`}
        note="※汚れ・素材に応じて金額が前後します。事前の問診にてすり合わせいたします。"
        onBook={goToBooking}
      />
    </div>
  );
}

function SummaryCard({
  rows,
  total,
  note,
  onBook,
}: {
  rows: { label: string; value: string; muted?: boolean }[];
  total?: string;
  note: string;
  onBook: () => void;
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-3 text-white">
          <Calculator className="h-4 w-4" />
          <span className="text-sm font-semibold">お見積り</span>
        </div>
        <div className="space-y-3 px-5 py-5 text-sm">
          {rows.map((r) => (
            <div key={r.label + r.value} className="flex items-baseline justify-between">
              <span className={cn("text-slate-600", r.muted && "text-xs")}>{r.label}</span>
              <span className={cn("font-medium text-slate-900", r.muted && "text-xs")}>{r.value}</span>
            </div>
          ))}
          {total && (
            <>
              <div className="my-2 border-t border-dashed border-slate-200" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-600">合計目安</span>
                <span className="text-3xl font-bold text-slate-900">{total}</span>
              </div>
            </>
          )}
          <p className="text-[11px] text-slate-500">{note}</p>
        </div>
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onBook}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-sm font-semibold text-white shadow transition-transform hover:scale-[1.02]"
          >
            この内容でカウンセリングを予約
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
