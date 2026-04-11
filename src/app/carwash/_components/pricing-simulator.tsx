"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import { carSizes, menus, options, type CarSize, type MenuId, type OptionId } from "../data";
import { SectionHeader } from "./services";
import { cn } from "@/lib/utils";

const yen = (n: number) => `¥${Math.round(n).toLocaleString("ja-JP")}`;

/**
 * クライアント側でメニュー選択を保持し、見積り額をリアルタイムに計算。
 * 「この内容で予約へ進む」で #booking の BookingForm にメニューIDをイベントで渡す。
 */
export function PricingSimulator() {
  const [size, setSize] = useState<CarSize>("S");
  const [menuId, setMenuId] = useState<MenuId>("premium");
  const [selected, setSelected] = useState<Set<OptionId>>(new Set());

  const menu = useMemo(() => menus.find((m) => m.id === menuId)!, [menuId]);
  const sizeItem = useMemo(() => carSizes.find((c) => c.id === size)!, [size]);

  const base = menu.basePrice * sizeItem.multiplier;
  const optionTotal = options
    .filter((o) => selected.has(o.id))
    .reduce((s, o) => s + o.price, 0);
  const total = base + optionTotal;

  const toggleOption = (id: OptionId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goToBooking = () => {
    // BookingForm 側にメニューとオプションを伝える
    window.dispatchEvent(
      new CustomEvent("carwash:prefill-booking", {
        detail: { menuId, size, options: Array.from(selected) },
      }),
    );
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="simulator"
      className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50 to-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Pricing"
          title="料金シミュレーター"
          description="車種・メニュー・オプションを選ぶだけで、今すぐお見積りを確認できます。"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_22rem]">
          {/* Controls */}
          <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Car size */}
            <div>
              <div className="text-sm font-semibold text-slate-900">1. 車種サイズ</div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {carSizes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSize(c.id)}
                    className={cn(
                      "flex flex-col items-start rounded-xl border px-3 py-3 text-left transition-colors",
                      size === c.id
                        ? "border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-200"
                        : "border-slate-200 hover:border-sky-300",
                    )}
                  >
                    <span className="text-sm font-semibold">{c.label}</span>
                    <span className="mt-0.5 text-[11px] text-slate-500">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu */}
            <div>
              <div className="text-sm font-semibold text-slate-900">2. メインメニュー</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {menus.map((m) => (
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
                      <div className="text-[11px] text-slate-500">{m.duration}</div>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {yen(m.basePrice * sizeItem.multiplier)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <div className="text-sm font-semibold text-slate-900">3. 追加オプション</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.map((o) => {
                  const active = selected.has(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggleOption(o.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                        active
                          ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                          : "border-slate-200 hover:border-sky-300",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex h-5 w-5 items-center justify-center rounded border",
                            active
                              ? "border-sky-500 bg-sky-500 text-white"
                              : "border-slate-300 bg-white",
                          )}
                        >
                          {active && (
                            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
                              <path d="M7.6 13.3 4.3 10l-1.1 1.1 4.4 4.4 9.2-9.2-1.1-1.1z" />
                            </svg>
                          )}
                        </span>
                        <span className="text-sm font-medium text-slate-900">{o.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">+{yen(o.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-3 text-white">
                <Calculator className="h-4 w-4" />
                <span className="text-sm font-semibold">お見積り</span>
              </div>
              <div className="space-y-3 px-5 py-5 text-sm">
                <Row label="車種" value={sizeItem.label} />
                <Row label="メニュー" value={menu.name} />
                <Row label="基本料金" value={yen(base)} />
                {options
                  .filter((o) => selected.has(o.id))
                  .map((o) => (
                    <Row key={o.id} label={o.label} value={`+${yen(o.price)}`} muted />
                  ))}
                <div className="my-2 border-t border-dashed border-slate-200" />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-600">合計(税込)</span>
                  <span className="text-3xl font-bold text-slate-900">{yen(total)}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ※ 汚れ状況により当日お見積りが変動する場合があります。
                </p>
              </div>
              <div className="border-t border-slate-100 p-4">
                <button
                  type="button"
                  onClick={goToBooking}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-sm font-semibold text-white shadow transition-transform hover:scale-[1.02]"
                >
                  この内容で予約へ進む
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-slate-600", muted && "text-xs")}>{label}</span>
      <span className={cn("font-medium text-slate-900", muted && "text-xs")}>{value}</span>
    </div>
  );
}
