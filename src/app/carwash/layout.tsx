import type { Metadata } from "next";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";
import { StickyCta } from "./_components/sticky-cta";
import { site } from "./data";

export const metadata: Metadata = {
  title: `${site.brand} | 渋谷の手洗い洗車・コーティング専門店`,
  description: site.catchCopy,
};

export default function CarwashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <StickyCta />
    </div>
  );
}
