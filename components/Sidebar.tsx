"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  AlertTriangle,
  Bell,
  Brain,
  Clock,
  Flag,
  Eye,
  Globe,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Map,
  Settings as SettingsIcon,
  Sparkles,
  Trophy,
  TrendingUp,
} from "lucide-react";

const primaryNavItems = [
  { label: "Dashboard",      href: "/dashboard",    icon: LayoutDashboard },
  { label: "Trade",          href: "/trade",         icon: TrendingUp },
  { label: "Orders",         href: "/orders",        icon: ListOrdered },
  { label: "Watchlist",      href: "/watchlist",     icon: Eye },
  { label: "History",        href: "/history",       icon: Clock },
  { label: "Missions",       href: "/missions",      icon: Map },
];

const secondaryNavItems = [
  { label: "Accountability", href: "/accountability", icon: AlertTriangle },
  { label: "Insights",       href: "/insights",      icon: Brain },
  { label: "Mistakes",       href: "/mistakes",      icon: AlertTriangle },
  { label: "AI Coach",       href: "/ai-coach",      icon: Sparkles },
  { label: "Alerts",         href: "/alerts",        icon: Bell },
  { label: "Leaderboard",    href: "/leaderboard",   icon: Trophy },
  { label: "Contests",       href: "/competitions",  icon: Flag },
];

export default function Sidebar({
  mobileOpen,
  collapsed,
  onCloseMobileAction,
}: {
  mobileOpen: boolean;
  collapsed: boolean;
  onCloseMobileAction: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hasPendingRequests, setHasPendingRequests] = useState(false);

  useEffect(() => {
    async function loadPendingRequests() {
      if (!session?.user?.id) {
        setHasPendingRequests(false);
        return;
      }

      try {
        const response = await fetch("/api/accountability/requests", { cache: "no-store" });
        if (!response.ok) {
          setHasPendingRequests(false);
          return;
        }

        const payload = (await response.json()) as { requests?: Array<{ pairId: string }> };
        setHasPendingRequests((payload.requests || []).length > 0);
      } catch {
        setHasPendingRequests(false);
      }
    }

    loadPendingRequests();
  }, [pathname, session?.user?.id]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col theme-bg-sidebar border-r theme-border transition-all duration-300 ${
        collapsed ? "w-[84px]" : "w-[220px]"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-sidebar)" }}
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center border-b py-4 ${collapsed ? "justify-center px-2" : "gap-3 px-5"}`}
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}
        >
          <Globe size={18} className="text-white" />
        </div>
        {!collapsed ? (
          <div>
            <p className="text-sm font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>
              TradeSphere
            </p>
            <p className="text-xs font-medium" style={{ color: "var(--color-blue)" }}>
              Trading Terminal
            </p>
          </div>
        ) : null}
      </div>

      {/* ── Nav items ── */}
      <nav className="flex flex-1 flex-col gap-0.5 p-2 overflow-y-auto">
        {primaryNavItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobileAction}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                active ? "sidebar-active" : "sidebar-inactive"
              }`}
              style={
                active
                  ? {
                      backgroundColor: "var(--bg-active)",
                      color: "var(--color-blue)",
                      borderLeft: `3px solid var(--color-blue)`,
                      paddingLeft: collapsed ? "9px" : "9px",
                    }
                  : {
                      color: "var(--text-secondary)",
                      borderLeft: "3px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={18} />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}

        <div className="my-2 border-t" style={{ borderColor: "var(--border)" }} />

        {secondaryNavItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const showAccountabilityBadge = item.href === "/accountability" && hasPendingRequests;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobileAction}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                active ? "sidebar-active" : "sidebar-inactive"
              }`}
              style={
                active
                  ? {
                      backgroundColor: "var(--bg-active)",
                      color: "var(--color-blue)",
                      borderLeft: `3px solid var(--color-blue)`,
                      paddingLeft: collapsed ? "9px" : "9px",
                    }
                  : {
                      color: "var(--text-secondary)",
                      borderLeft: "3px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={18} />
              {!collapsed ? (
                <span className="flex items-center gap-2">
                  {item.label}
                  {showAccountabilityBadge ? <span className="h-2 w-2 rounded-full bg-rose-500" /> : null}
                </span>
              ) : showAccountabilityBadge ? (
                <span className="ml-1 h-2 w-2 rounded-full bg-rose-500" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer actions ── */}
      <div className="border-t p-2 space-y-1" style={{ borderColor: "var(--border)" }}>
        {!collapsed && session?.user?.email ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              {session.user.email.charAt(0).toUpperCase()}
            </div>
            <p
              className="truncate text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {session.user.email}
            </p>
            {session.user?.isPro ? (
              <span className="shrink-0 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-black">
                PRO
              </span>
            ) : null}
          </div>
        ) : null}

        {session && !session.user?.isPro ? (
          <Link
            href="/pricing"
            onClick={onCloseMobileAction}
            title={collapsed ? "Upgrade to Pro" : undefined}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
          >
            {collapsed ? "PRO" : "⚡ Upgrade to Pro"}
          </Link>
        ) : null}

        <Link
          href="/settings"
          onClick={onCloseMobileAction}
          title={collapsed ? "Settings" : undefined}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          }}
        >
          <SettingsIcon size={16} />
          {!collapsed ? "Settings" : null}
        </Link>

        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Logout" : undefined}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-loss-bg)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-loss)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            <LogOut size={16} />
            {!collapsed ? "Logout" : null}
          </button>
        ) : (
          <Link
            href="/login"
            onClick={onCloseMobileAction}
            title={collapsed ? "Login" : undefined}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all"
            style={{ color: "var(--text-secondary)" }}
          >
            {!collapsed ? "Login" : null}
          </Link>
        )}
      </div>
    </aside>
  );
}
