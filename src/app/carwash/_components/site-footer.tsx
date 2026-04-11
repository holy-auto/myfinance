import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "../data";

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

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-950 pb-28 text-slate-300 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-bold text-white">{site.brand}</div>
          <p className="mt-2 max-w-md text-sm text-slate-400">{site.catchCopy}</p>
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
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-400" />
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-white">フォロー</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <InstagramIcon className="h-4 w-4 text-sky-400" />
                Instagram
              </a>
            </li>
            <li>
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <span className="inline-block h-4 w-4 rounded-full bg-[#06C755]" />
                LINE公式
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
