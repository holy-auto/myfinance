"use client";

import { Phone, CalendarCheck } from "lucide-react";
import { site } from "../data";

/**
 * モバイル画面でのみ表示される下部固定アクションバー。
 * 電話 / Instagram DM / 予約フォームへのショートカット。
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
          href={site.social.instagram}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 flex-col items-center justify-center rounded-lg text-[10px] font-medium text-slate-700"
        >
          <InstagramIcon className="h-5 w-5 text-pink-500" />
          Instagram
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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
