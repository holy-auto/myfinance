"use client";

import { useEffect, useState } from "react";
import { Sparkles, Menu as MenuIcon, X } from "lucide-react";
import { site } from "../data";
import { cn } from "@/lib/utils";

const nav = [
  { href: "#services", label: "メニュー" },
  { href: "#simulator", label: "料金シミュレーター" },
  { href: "#access", label: "アクセス" },
  { href: "#booking", label: "予約" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        scrolled
          ? "border-b border-slate-200 bg-white/90 backdrop-blur"
          : "border-b border-transparent bg-white/60 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a
          href="#top"
          onClick={handleNavClick("#top")}
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-base sm:text-lg">{site.brand}</span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={handleNavClick(item.href)}
              className="text-sm font-medium text-slate-700 transition-colors hover:text-sky-600"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#booking"
            onClick={handleNavClick("#booking")}
            className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] hover:shadow-md"
          >
            今すぐ予約
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="メニューを開く"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="flex flex-col px-4 py-3">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleNavClick(item.href)}
                className="py-3 text-sm font-medium text-slate-700"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#booking"
              onClick={handleNavClick("#booking")}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-sm font-semibold text-white shadow-sm"
            >
              今すぐ予約
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
