import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "../data";

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

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-950 pb-28 text-slate-300 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-bold text-white">{site.brand}</div>
          <p className="mt-2 max-w-md text-sm text-slate-400">{site.catchCopy}</p>
          <div className="mt-3 text-xs text-slate-500">
            {site.director.title}：{site.director.name}（{site.director.license}）
          </div>
          <div className="mt-1 text-xs text-slate-500">
            登録番号：<span className="font-mono">{site.registrationNo}</span>
          </div>
          {site.brands.length > 0 && (
            <div className="mt-3 text-xs text-slate-500">
              取り扱いブランド：{site.brands.join("、")}
            </div>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold text-white">お問い合わせ</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <span>
                〒{site.address.zip}
                <br />
                {site.address.full}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-sky-400" />
              <a href={`tel:${site.tel}`} className="hover:text-white">
                {site.telDisplay}
              </a>
            </li>
            {site.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-400" />
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-white">SNS・フォロー</div>
          <ul className="mt-3 space-y-3 text-sm">
            <li>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-2 hover:text-white"
              >
                <InstagramIcon className="mt-0.5 h-4 w-4 text-pink-400" />
                <div>
                  <div>{site.social.instagramHandle}</div>
                  <div className="text-[11px] text-slate-500 group-hover:text-slate-400">
                    {site.social.instagramName}
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a
                href={site.social.x}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-2 hover:text-white"
              >
                <XIcon className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <div>{site.social.xHandle}</div>
                  <div className="text-[11px] text-slate-500 group-hover:text-slate-400">
                    {site.social.xName}
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-500">
          © {new Date().getFullYear()} {site.brand}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
