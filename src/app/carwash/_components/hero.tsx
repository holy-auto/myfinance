import { Phone, CalendarCheck, Stethoscope } from "lucide-react";
import { site } from "../data";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-sky-50 via-cyan-50 to-white" />
      <div aria-hidden className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-sky-200 to-cyan-200 opacity-60 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-100 to-sky-100 opacity-60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm backdrop-blur">
          <Stethoscope className="h-3.5 w-3.5" />
          さいたま市岩槻区・塗装診断＆コーティング専門
        </div>

        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          {site.tagline}
        </h1>
        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          {site.concept[0]}
          <br className="hidden sm:inline" />
          {site.concept[2]}
        </p>

        {site.freeCounseling && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            無料カウンセリング実施中（車両状態確認・施術提案）
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#booking"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-6 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:scale-[1.03]"
          >
            <CalendarCheck className="h-5 w-5" />
            無料カウンセリングを予約
          </a>
          <a
            href={`tel:${site.tel}`}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-base font-semibold text-slate-900 shadow-sm transition-colors hover:border-sky-400 hover:text-sky-700"
          >
            <Phone className="h-5 w-5" />
            {site.telDisplay}
          </a>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 text-base font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
          >
            <InstagramIcon className="h-5 w-5" />
            Instagram DM
          </a>
        </div>

        {/* Director card */}
        <div className="mt-12 grid max-w-xl gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-cyan-200 text-xl font-bold text-sky-700">
              中
            </div>
            <div>
              <div className="text-xs text-slate-500">{site.director.title}</div>
              <div className="text-base font-bold text-slate-900">{site.director.name}</div>
              <div className="text-xs text-slate-500">{site.director.license}</div>
              <ul className="mt-2 space-y-0.5">
                {site.director.bio.map((b) => (
                  <li key={b} className="text-[11px] text-slate-600">・{b}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
            <div className="space-y-2">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm hover:text-pink-600"
              >
                <InstagramIcon className="h-5 w-5 text-pink-500" />
                <div>
                  <div className="font-semibold">{site.social.instagramHandle}</div>
                  <div className="text-[11px] text-slate-500">{site.social.instagramName}</div>
                </div>
              </a>
              <a
                href={site.social.x}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm hover:text-slate-900"
              >
                <XIcon className="h-5 w-5 text-slate-800" />
                <div>
                  <div className="font-semibold">{site.social.xHandle}</div>
                  <div className="text-[11px] text-slate-500">{site.social.xName}</div>
                </div>
              </a>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              登録番号：<span className="font-mono">{site.registrationNo}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
