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
  { label: "Mistakes", href: "/mistakes", icon: AlertTriangle },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "AI Coach", href: "/ai-coach", icon: Sparkles },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-[#1a2744] bg-[#0a0f1a]">
      <div className="flex items-center gap-3 border-b border-[#1a2744] px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d1421] text-[#3b82f6]">
          <Globe size={18} />
        </div>
        <div>
          <p className="text-lg font-bold tracking-wide text-white">TradeSphere</p>
          <p className="text-xs font-medium text-[#3b82f6]">Trading Terminal</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-l-[3px] border-[#3b82f6] bg-[#0f1929] pl-[9px] text-white"
                  : "text-[#9ca3af] hover:bg-[#0d1421] hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#1a2744] p-3">
        <p className="truncate text-xs text-[#9ca3af]">{session?.user?.email ?? "Guest"}</p>
        <Link
          href="/settings"
          className="mt-2 flex w-full items-center gap-2 rounded-lg bg-[#0d1421] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1a2744]"
        >
          <SettingsIcon size={16} />
          Settings
        </Link>
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0d1421] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1a2744]"
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#0d1421] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1a2744]"
          >
            Login
          </Link>
        )}
      </div>
    </aside>
  );
}
