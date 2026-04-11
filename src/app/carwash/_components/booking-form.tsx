"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Loader2 } from "lucide-react";
import {
  carSizes,
  menus,
  options,
  timeSlots,
  type CarSize,
  type MenuId,
  type OptionId,
} from "../data";
import { SectionHeader } from "./services";
import { cn } from "@/lib/utils";

const yen = (n: number) => `¥${Math.round(n).toLocaleString("ja-JP")}`;

/** 今日から14日後までの日付を返す（定休日は除外） */
function nextDates(count: number) {
  const days: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30 && days.length < count; i++) {
    const candidate = new Date(d);
    candidate.setDate(d.getDate() + i);
    days.push(candidate);
  }
  return days;
}

export function BookingForm() {
  const [size, setSize] = useState<CarSize>("S");
  const [menuId, setMenuId] = useState<MenuId>("premium");
  const [selectedOptions, setSelectedOptions] = useState<Set<OptionId>>(new Set());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [carModel, setCarModel] = useState("");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState<string>("10:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // 料金シミュレーターから遷移してきたら値をプリフィル
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{
        menuId: MenuId;
        size: CarSize;
        options: OptionId[];
      }>).detail;
      if (!detail) return;
      setMenuId(detail.menuId);
      setSize(detail.size);
      setSelectedOptions(new Set(detail.options));
      toast.success("シミュレーターの内容を予約フォームに反映しました");
    };
    window.addEventListener("carwash:prefill-booking", handler);
    return () => window.removeEventListener("carwash:prefill-booking", handler);
  }, []);

  const menu = useMemo(() => menus.find((m) => m.id === menuId)!, [menuId]);
  const sizeItem = useMemo(() => carSizes.find((c) => c.id === size)!, [size]);
  const optionTotal = options
    .filter((o) => selectedOptions.has(o.id))
    .reduce((s, o) => s + o.price, 0);
  const total = menu.basePrice * sizeItem.multiplier + optionTotal;

  const dateOptions = useMemo(() => nextDates(14), []);

  const toggleOption = (id: OptionId) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("お名前とお電話番号は必須です");
      return;
    }
    setLoading(true);
    // モック送信: 本番では /api/v1/carwash-booking 等に POST
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success("ご予約を受け付けました。折り返しご連絡いたします。");
    setName("");
    setPhone("");
    setEmail("");
    setCarModel("");
    setNotes("");
  };

  return (
    <section
      id="booking"
      className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeader
          eyebrow="Booking"
          title="オンライン予約"
          description="必要事項を入力するだけ、30秒で送信完了。内容確認のため後ほど担当よりご連絡します。"
        />

        <form
          onSubmit={onSubmit}
          className="mt-10 space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Menu summary - 現在の選択を可視化 */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <span className="font-semibold text-slate-900">{menu.name}</span>
                <span className="ml-2 text-slate-500">/ {sizeItem.label}</span>
              </div>
              <div className="text-lg font-bold text-sky-700">{yen(total)}</div>
            </div>
            {selectedOptions.size > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {options
                  .filter((o) => selectedOptions.has(o.id))
                  .map((o) => (
                    <span
                      key={o.id}
                      className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-sky-800 ring-1 ring-sky-200"
                    >
                      {o.label}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Car size */}
          <Field label="車種サイズ" required>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {carSizes.map((c) => (
                <ChoiceButton
                  key={c.id}
                  active={size === c.id}
                  onClick={() => setSize(c.id)}
                >
                  {c.label}
                </ChoiceButton>
              ))}
            </div>
          </Field>

          {/* Menu */}
          <Field label="メニュー" required>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {menus.map((m) => (
                <ChoiceButton
                  key={m.id}
                  active={menuId === m.id}
                  onClick={() => setMenuId(m.id)}
                >
                  {m.name}
                </ChoiceButton>
              ))}
            </div>
          </Field>

          {/* Options */}
          <Field label="オプション（任意・複数可）">
            <div className="flex flex-wrap gap-2">
              {options.map((o) => {
                const active = selectedOptions.has(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggleOption(o.id)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors",
                      active
                        ? "border-sky-500 bg-sky-500 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-sky-400",
                    )}
                  >
                    {o.label} +{yen(o.price)}
                  </button>
                );
              })}
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
                  const label = `${d.getMonth() + 1}/${d.getDate()}(${["日", "月", "火", "水", "木", "金", "土"][d.getDay()]})`;
                  return (
                    <option key={iso} value={iso}>
                      {label}
                    </option>
                  );
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
              <TextInput
                value={name}
                onChange={setName}
                placeholder="山田 太郎"
                autoComplete="name"
              />
            </Field>
            <Field label="電話番号" required>
              <TextInput
                value={phone}
                onChange={setPhone}
                placeholder="090-0000-0000"
                type="tel"
                autoComplete="tel"
              />
            </Field>
            <Field label="メールアドレス">
              <TextInput
                value={email}
                onChange={setEmail}
                placeholder="taro@example.com"
                type="email"
                autoComplete="email"
              />
            </Field>
            <Field label="車種(例: ヤリス 2021)">
              <TextInput value={carModel} onChange={setCarModel} placeholder="車名・年式など" />
            </Field>
          </div>

          <Field label="ご要望・メモ">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="気になる汚れ、希望ブランドなどあればご記入ください"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CalendarCheck className="h-5 w-5" />
            )}
            この内容で予約する
          </button>
          <p className="text-center text-[11px] text-slate-500">
            送信後、担当より電話またはメールで確定のご連絡をいたします。
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
    />
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors",
        active
          ? "border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-200"
          : "border-slate-300 bg-white text-slate-700 hover:border-sky-400",
      )}
    >
      {children}
    </button>
  );
}
