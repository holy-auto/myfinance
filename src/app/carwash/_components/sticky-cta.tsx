"use client";

import { Phone, CalendarCheck } from "lucide-react";
import { site } from "../data";

/**
 * モバイル画面でのみ表示される下部固定アクションバー。
 * 電話 / LINE / 予約フォームへのショートカット。
 */
export function StickyCta() {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_20px_-12px_rgba(0,0,0,0.15)] backdrop-blur md:hidden">
      <div
        className="grid grid-cols-3 gap-1 px-2 py-2"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <a
          href={`tel:${site.tel}`}
          className="inline-flex h-12 flex-col items-center justify-center rounded-lg text-[10px] font-medium text-slate-700"
        >
          <Phone className="h-5 w-5 text-sky-600" />
          電話
        </a>
        <a
          href={site.lineUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 flex-col items-center justify-center rounded-lg text-[10px] font-medium text-slate-700"
        >
          <LineIcon className="h-5 w-5 text-[#06C755]" />
          LINE
        </a>
        <button
          type="button"
          onClick={scrollToBooking}
          className="inline-flex h-12 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-3 text-sm font-semibold text-white shadow"
        >
          <CalendarCheck className="h-4 w-4" />
          予約
        </button>
      </div>
    </div>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 3C6.48 3 2 6.58 2 10.99c0 3.97 3.64 7.29 8.56 7.92.33.07.78.22.9.5.1.25.07.65.03.9l-.15.9c-.05.27-.22 1.05.92.57s6.13-3.61 8.37-6.18c1.54-1.7 2.27-3.42 2.27-5.6C22.96 6.58 18.48 3 12 3Z" />
    </svg>
  );
}
