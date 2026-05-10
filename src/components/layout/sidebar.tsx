"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BarChart3,
  FileText,
  Settings,
  Users,
  Lock,
  LayoutDashboard,
  List,
  Building2,
  Tags,
  Upload,
  Banknote,
  Wallet,
  Paperclip,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string }[];
};

const navigation: NavItem[] = [
  { name: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { name: "仕訳管理", href: "/journal", icon: BookOpen },
  { name: "勘定科目", href: "/accounts", icon: List },
  {
    name: "マスタ",
    href: "/master",
    icon: Tags,
    children: [
      { name: "取引先", href: "/counterparties" },
      { name: "部門", href: "/departments" },
      { name: "事業区分", href: "/business-units" },
      { name: "プロジェクト", href: "/projects" },
      { name: "自動仕訳ルール", href: "/journal-rules" },
    ],
  },
  { name: "証憑", href: "/attachments", icon: Paperclip },
  { name: "CSV取込", href: "/import", icon: Upload },
  {
    name: "銀行・カード",
    href: "/bank",
    icon: Banknote,
    children: [
      { name: "口座一覧", href: "/bank" },
      { name: "明細インポート", href: "/bank/import" },
      { name: "突合", href: "/bank/match" },
    ],
  },
  { name: "予算管理", href: "/budget", icon: Wallet },
  {
    name: "レポート",
    href: "/reports",
    icon: BarChart3,
    children: [
      { name: "試算表", href: "/reports/trial-balance" },
      { name: "損益計算書（PL）", href: "/reports/pnl" },
      { name: "貸借対照表（BS）", href: "/reports/balance-sheet" },
      { name: "総勘定元帳", href: "/reports/general-ledger" },
      { name: "事業別PL", href: "/reports/segment" },
      { name: "予実比較", href: "/reports/budget-actual" },
      { name: "キャッシュフロー", href: "/reports/cash-flow" },
    ],
  },
  { name: "月次締め", href: "/closing", icon: Lock },
  {
    name: "管理",
    href: "/admin",
    icon: Users,
    children: [
      { name: "ユーザー", href: "/admin/users" },
      { name: "ロール", href: "/admin/roles" },
      { name: "監査ログ", href: "/admin/audit-logs" },
    ],
  },
  { name: "設定", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const isItemActive = (item: NavItem): boolean => {
    if (item.href === "/") return pathname === "/";
    if (pathname.startsWith(item.href) && item.href !== "/master") return true;
    if (item.children) {
      return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
    }
    return false;
  };

  const toggle = (key: string) => setOpenMap((s) => ({ ...s, [key]: !s[key] }));

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">MyFinance</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const isActive = isItemActive(item);
          const isOpen = openMap[item.name] ?? isActive;
          const Icon = item.icon;
          const hasChildren = !!item.children;

          if (hasChildren) {
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => toggle(item.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
                {isOpen && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.children!.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-md px-3 py-1.5 text-sm transition-colors",
                            childActive
                              ? "font-medium text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5" />
          <span>MyFinance Edition</span>
        </div>
      </div>
    </aside>
  );
}
