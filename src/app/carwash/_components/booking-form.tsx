"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Loader2 } from "lucide-react";
import {
  menus,
  serviceCategories,
  carSizes,
  timeSlots,
  type MenuId,
  type CarSize,
  type ServiceCategory,
} from "../data";
import { SectionHeader } from "./services";
import { cn } from "@/lib/utils";

/** 今日から最大30日先まで日付を返す */
function nextDates(count: number) {
  const days: Date[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 1; days.length < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d);
    if (i > 60) break;
  }
  return days;
}

const DAY_SHORT = ["日", "月", "火", "水", "木", "金", "土"] as const;
const simCats = serviceCategories.filter((c) => c.id !== "b2b");

export function BookingForm() {
  const [category, setCategory] = useState<ServiceCategory>("wash");
  const [menuId, setMenuId] = useState<MenuId>("wash-full");
  const [size, setSize] = useState<CarSize>("S");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [carModel, setCarModel] = useState("");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // シミュレーターからのプリフィル
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ menuId: MenuId; category: ServiceCategory }>).detail;
      if (!detail) return;
      setCategory(detail.category);
      setMenuId(detail.menuId);
      toast.success("シミュレーターの内容を予約フォームに反映しました");
    };
    window.addEventListener("carwash:prefill-booking", handler);
    return () => window.removeEventListener("carwash:prefill-booking", handler);
  }, []);

  // カテゴリー変更時はメニューをリセット
  const categoryMenus = useMemo(
    () => menus.filter((m) => m.category === category),
    [category],
  );
  const selectedMenu = useMemo(
    () => menus.find((m) => m.id === menuId) ?? categoryMenus[0],
    [menuId, categoryMenus],
  );

  const dateOptions = useMemo(() => nextDates(14), []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("お名前とお電話番号は必須です");
      return;
    }
    setLoading(true);
    // モック送信（本番では /api/v1/carwash-booking 等に POST）
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success("ご予約を受け付けました。折り返しご連絡いたします。");
    setName(""); setPhone(""); setEmail(""); setCarModel(""); setNotes("");
  };

  return (
    <section
      id="booking"
      className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeader
          eyebrow="Booking"
          title="無料カウンセリング・予約"
          description="希望の施術とご都合を入力して送信するだけ。後ほど院長より確認のご連絡をいたします。"
        />

        <form
          onSubmit={onSubmit}
          className="mt-10 space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Selected menu summary */}
          {selectedMenu && (
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-900">{selectedMenu.name}</span>
                  <span className="ml-2 text-slate-500">{selectedMenu.duration}</span>
                </div>
                <div className="text-base font-bold text-sky-700">{selectedMenu.priceLabel}</div>
              </div>
            </div>
          )}

          {/* Category */}
          <Field label="施術カテゴリー" required>
            <div className="flex flex-wrap gap-2">
              {simCats.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    const first = menus.find((m) => m.category === cat.id);
                    if (first) setMenuId(first.id);
                  }}
                  className={cn(
                    "inline-flex h-9 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors",
                    category === cat.id
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-sky-400",
                  )}
                >
                  <span aria-hidden>{cat.icon}</span>
                  {cat.short}
                </button>
              ))}
            </div>
          </Field>

          {/* Menu within category */}
          <Field label="メニュー" required>
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
                      : "border-slate-300 bg-white hover:border-sky-400",
                  )}
                >
                  <span className="text-sm font-medium text-slate-900">{m.name}</span>
                  <span className="ml-2 text-xs font-semibold text-slate-700 whitespace-nowrap">
                    {m.priceLabel}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          {/* Car size */}
          <Field label="車種サイズ（参考）" required>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {carSizes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSize(c.id)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border px-3 py-3 text-left transition-colors",
                    size === c.id
                      ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                      : "border-slate-300 bg-white hover:border-sky-400",
                  )}
                >
                  <span className="text-sm font-semibold text-slate-900">{c.label}</span>
                  <span className="mt-0.5 text-[11px] text-slate-500">{c.desc}</span>
                </button>
              ))}
            </div>
          </Field>

          {/* Date / Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="希望日" required>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {dateOptions.map((d) => {
                  const iso = d.toISOString().slice(0, 10);
                  const label = `${d.getMonth() + 1}/${d.getDate()}(${DAY_SHORT[d.getDay()]})`;
                  return <option key={iso} value={iso}>{label}</option>;
                })}
              </select>
            </Field>
            <Field label="希望時間" required>
              <div className="flex flex-wrap gap-1.5">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={cn(
                      "inline-flex h-9 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                      time === t
                        ? "border-sky-500 bg-sky-500 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-sky-400",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Customer info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="お名前" required>
              <TextInput value={name} onChange={setName} placeholder="山田 太郎" autoComplete="name" />
            </Field>
            <Field label="電話番号" required>
              <TextInput value={phone} onChange={setPhone} placeholder="090-0000-0000" type="tel" autoComplete="tel" />
            </Field>
            <Field label="メールアドレス">
              <TextInput value={email} onChange={setEmail} placeholder="taro@example.com" type="email" autoComplete="email" />
            </Field>
            <Field label="車種（例：ヤリス 2021年式）">
              <TextInput value={carModel} onChange={setCarModel} placeholder="車名・年式など" />
            </Field>
          </div>

          <Field label="ご要望・状態メモ">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="気になる傷・汚れ・シミ、ご要望があればご記入ください"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarCheck className="h-5 w-5" />}
            送信する
          </button>
          <p className="text-center text-[11px] text-slate-500">
            送信後、院長より電話またはInstagram DMにて確定のご連絡をいたします。
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-900">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", autoComplete }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; autoComplete?: string;
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} autoComplete={autoComplete}
      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
    />
  );
}
