import { Phone, CalendarCheck, Sparkles } from "lucide-react";
import { site } from "../data";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Background gradient & decoration */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-sky-50 via-cyan-50 to-white"
      />
      <div
        aria-hidden
        className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-sky-200 to-cyan-200 opacity-60 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-100 to-sky-100 opacity-60 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          渋谷エリア・手洗い洗車専門
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          {site.tagline}
        </h1>
        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          {site.catchCopy}
          <br className="hidden sm:inline" />
          ご予約は30秒で完了。当日のご相談もお気軽にどうぞ。
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#booking"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-6 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:scale-[1.03]"
          >
            <CalendarCheck className="h-5 w-5" />
            オンライン予約
          </a>
          <a
            href={`tel:${site.tel}`}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-base font-semibold text-slate-900 shadow-sm transition-colors hover:border-sky-400 hover:text-sky-700"
          >
            <Phone className="h-5 w-5" />
            電話する
          </a>
          <a
            href={site.lineUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#06C755] px-6 text-base font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
          >
            <LineIcon className="h-5 w-5" />
            LINEで相談
          </a>
        </div>

        {/* Trust bar */}
        <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-4 sm:gap-8">
          <div>
            <dt className="text-xs text-slate-500">累計施工</dt>
            <dd className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              12,000<span className="text-base font-medium">台</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Google評価</dt>
            <dd className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              4.9<span className="text-base font-medium">/5.0</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">リピート率</dt>
            <dd className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              87<span className="text-base font-medium">%</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M12 3C6.48 3 2 6.58 2 10.99c0 3.97 3.64 7.29 8.56 7.92.33.07.78.22.9.5.1.25.07.65.03.9l-.15.9c-.05.27-.22 1.05.92.57s6.13-3.61 8.37-6.18c1.54-1.7 2.27-3.42 2.27-5.6C22.96 6.58 18.48 3 12 3Zm-3.1 9.3h-2.1c-.1 0-.18-.08-.18-.18v-3.5c0-.1.08-.18.18-.18h.55c.1 0 .18.08.18.18v2.77h1.36c.1 0 .18.08.18.18v.54c0 .11-.08.19-.18.19Zm1.07-.18c0 .1-.09.18-.19.18h-.54c-.1 0-.18-.08-.18-.18V8.63c0-.1.08-.18.18-.18h.54c.1 0 .19.08.19.18v3.5Zm3.96 0c0 .1-.09.18-.19.18h-.54a.17.17 0 0 1-.14-.07l-1.6-2.16v2.05c0 .1-.08.18-.18.18h-.54c-.1 0-.18-.08-.18-.18V8.63c0-.1.08-.18.18-.18h.54c.05 0 .11.03.14.07l1.6 2.16V8.63c0-.1.08-.18.18-.18h.54c.1 0 .19.08.19.18v3.5Zm3.18-2.77h-1.36v.52h1.36c.1 0 .18.08.18.18v.54c0 .1-.08.18-.18.18h-1.36v.53h1.36c.1 0 .18.08.18.18v.54c0 .1-.08.18-.18.18h-2.1c-.1 0-.18-.08-.18-.18V8.63c0-.1.08-.18.18-.18h2.1c.1 0 .18.08.18.18v.54c0 .1-.08.18-.18.18Z" />
    </svg>
  );
}
