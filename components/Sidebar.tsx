"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  AlertTriangle,
  BarChart2,
  Bell,
  Brain,
  Clock,
  Eye,
  Globe,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Settings as SettingsIcon,
  Sparkles,
  Trophy,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trade", href: "/trade", icon: TrendingUp },
  { label: "Orders", href: "/orders", icon: ListOrdered },
  { label: "Watchlist", href: "/watchlist", icon: Eye },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "History", href: "/history", icon: Clock },
  { label: "TradeMind", href: "/mood", icon: Brain },
  { label: "Bad Trades", href: "/mistakes", icon: AlertTriangle },
  { label: "Why I'm Losing", href: "/analytics", icon: BarChart2 },
  { label: "My Coach", href: "/ai-coach", icon: Sparkles },
  { label: "Competitions", href: "/competitions", icon: Trophy },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export default function Sidebar({
  mobileOpen,
  collapsed,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  collapsed: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-[#1a2744] bg-[#0a0f1a] transition-all duration-300 ${
        collapsed ? "w-[84px]" : "w-[220px]"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className={`flex items-center border-b border-[#1a2744] py-4 ${collapsed ? "justify-center px-2" : "gap-3 px-5"}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d1421] text-[#3b82f6]">
          <Globe size={18} />
        </div>
        {!collapsed ? (
          <div>
            <p className="text-lg font-bold tracking-wide text-white">TradeSphere</p>
            <p className="text-xs font-medium text-[#3b82f6]">Trading Terminal</p>
          </div>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-l-[3px] border-[#3b82f6] bg-[#0f1929] pl-[9px] text-white"
                  : "text-[#9ca3af] hover:bg-[#0d1421] hover:text-white"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#1a2744] p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <p className="truncate text-xs text-[#9ca3af]">{session?.user?.email ?? "Guest"}</p>
            {session?.user?.isPro ? <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-black">PRO</span> : null}
          </div>
        ) : null}
        {session && !session.user?.isPro ? (
          <Link
            href="/pricing"
            onClick={onCloseMobile}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
            title={collapsed ? "Upgrade to Pro" : undefined}
          >
            {collapsed ? "PRO" : "Upgrade to Pro"}
          </Link>
        ) : null}
        <Link
          href="/settings"
          onClick={onCloseMobile}
          className="mt-2 flex w-full items-center gap-2 rounded-lg bg-[#0d1421] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1a2744]"
          title={collapsed ? "Settings" : undefined}
        >
          <SettingsIcon size={16} />
          {!collapsed ? "Settings" : null}
        </Link>
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0d1421] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1a2744]"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={16} />
            {!collapsed ? "Logout" : null}
          </button>
        ) : (
          <Link
            href="/login"
            onClick={onCloseMobile}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#0d1421] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1a2744]"
            title={collapsed ? "Login" : undefined}
          >
            {!collapsed ? "Login" : null}
          </Link>
        )}
      </div>
    </aside>
  );
}
