"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";
import { site, businessHours, DAY_LABELS } from "../data";
import { SectionHeader } from "./services";
import { cn } from "@/lib/utils";

/** "HH:mm" を分に変換 */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function computeStatus(now: Date): { open: boolean; message: string } {
  const day = now.getDay();
  const hours = businessHours[day];
  const minutes = now.getHours() * 60 + now.getMinutes();

  if (hours) {
    const openMin = toMinutes(hours.open);
    const closeMin = toMinutes(hours.close);
    if (minutes >= openMin && minutes < closeMin) {
      return { open: true, message: `営業中 ・ ${hours.close} まで` };
    }
    if (minutes < openMin) {
      return { open: false, message: `本日${hours.open}から営業` };
    }
  }
  // 今日が定休/営業終了 → 次の営業日を探す
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const h = businessHours[d];
    if (h) {
      const label = i === 1 ? "明日" : `${DAY_LABELS[d]}曜`;
      return { open: false, message: `${label} ${h.open}から営業` };
    }
  }
  return { open: false, message: "準備中" };
}

export function Access() {
  const [status, setStatus] = useState<{ open: boolean; message: string }>(() => ({
    open: false,
    message: "読み込み中…",
  }));

  useEffect(() => {
    // サーバー/クライアントの時差ハイドレーション不整合を避けるため mount 後に算出
    const update = () => setStatus(computeStatus(new Date()));
    update();
    const t = setInterval(update, 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(site.address.mapQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.mapQuery)}`;

  return (
    <section id="access" className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
      <SectionHeader
        eyebrow="Access"
        title="アクセス・営業時間"
        description="さいたま市岩槻区末田にある完全予約制のプライベートクリニックです。駐車スペースあり。お気軽にお問い合わせください。"
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Map */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <div className="aspect-[16/10] w-full">
            <iframe
              src={mapSrc}
              title="店舗地図"
              loading="lazy"
              className="h-full w-full"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={mapLink}
            target="_blank"
            rel="noreferrer"
            className="absolute top-3 right-3 inline-flex h-9 items-center gap-1 rounded-full bg-white/95 px-3 text-xs font-semibold text-slate-900 shadow ring-1 ring-slate-200 transition-colors hover:text-sky-700"
          >
            Googleマップで開く
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
              status.open
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-700",
            )}
          >
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                status.open ? "animate-pulse bg-emerald-500" : "bg-slate-400",
              )}
            />
            {status.message}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <dl className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                <div>
                  <dt className="text-xs text-slate-500">所在地</dt>
                  <dd className="font-medium text-slate-900">〒{site.address.zip}</dd>
                  <dd className="font-medium text-slate-900">{site.address.full}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                <div>
                  <dt className="text-xs text-slate-500">電話</dt>
                  <dd>
                    <a
                      href={`tel:${site.tel}`}
                      className="text-base font-bold text-slate-900 tracking-wider hover:text-sky-700"
                    >
                      {site.telDisplay}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                <div className="flex-1">
                  <dt className="text-xs text-slate-500">営業時間</dt>
                  <dd>
                    <ul className="mt-1 space-y-1">
                      {DAY_LABELS.map((label, i) => {
                        const h = businessHours[i];
                        return (
                          <li
                            key={label}
                            className="flex items-center justify-between text-[13px]"
                          >
                            <span className="w-10 text-slate-500">{label}曜</span>
                            <span className="font-medium text-slate-800">
                              {h ? `${h.open} – ${h.close}` : "定休日"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
