"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface PortfolioSummary {
  balance: number;
  pnl: number;
}

interface LeaderboardSummary {
  yourRank: number | null;
}

interface StreakInsight {
  type: string;
  meta?: {
    streakType?: "win" | "loss" | "none";
    streakCount?: number;
  };
}

function getTitle(pathname: string): string {
  const titleMap: Record<string, string> = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/trade": "Trade",
    "/orders": "Orders",
    "/watchlist": "Watchlist",
    "/alerts": "Alerts",
    "/history": "History",
    "/mood": "TradeMind",
    "/mistakes": "Mistakes",
    "/analytics": "Analytics",
    "/ai-coach": "AI Coach",
    "/leaderboard": "Leaderboard",
    "/competitions": "Competitions",
    "/settings": "Settings",
    "/pricing": "Pricing",
    "/verify-otp": "Verify OTP",
    "/login": "Login",
    "/signup": "Sign Up",
    "/onboarding": "Onboarding",
  };
  return titleMap[pathname] || "TradeSphere";
}

export default function TopBar({
  onOpenMobileMenu,
  onToggleSidebar,
  sidebarCollapsed,
}: {
  onOpenMobileMenu: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}) {
  const pathname = usePathname();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [yourRank, setYourRank] = useState<number | null>(null);
  const [streak, setStreak] = useState<{ type: "win" | "loss" | "none"; count: number }>({ type: "none", count: 0 });

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const [portfolioResponse, leaderboardResponse, insightsResponse] = await Promise.all([
          fetch("/api/portfolio", { cache: "no-store" }),
          fetch("/api/leaderboard", { cache: "no-store" }),
          fetch("/api/insights", { cache: "no-store" }),
        ]);

        if (!portfolioResponse.ok) return;
        const data = (await portfolioResponse.json()) as PortfolioSummary;
        if (isMounted) setSummary(data);

        if (leaderboardResponse.ok && isMounted) {
          const leaderboardData = (await leaderboardResponse.json()) as LeaderboardSummary;
          setYourRank(leaderboardData.yourRank);
        }

        if (insightsResponse.ok && isMounted) {
          const insights = (await insightsResponse.json()) as StreakInsight[];
          const streakInsight = insights.find((item) => item.type === "streak");
          setStreak({
            type: streakInsight?.meta?.streakType || "none",
            count: Number(streakInsight?.meta?.streakCount || 0),
          });
        }
      } catch {
        // Ignore polling errors
      }
    }

    loadSummary();
    const intervalId = setInterval(loadSummary, 30000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [pathname]);

  const title = useMemo(() => getTitle(pathname), [pathname]);
  const pnl = summary?.pnl ?? 0;

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between px-2 backdrop-blur sm:px-4 lg:px-6 transition-all duration-300"
      style={{
        backgroundColor: "var(--bg-topbar)",
        boxShadow: "var(--shadow-topbar)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left: menu + title */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all theme-btn-icon md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-9 w-9 items-center justify-center rounded-lg transition-all theme-btn-icon md:inline-flex"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <h1
          className="text-sm font-semibold tracking-wide md:text-base"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
      </div>

      {/* Right: stats + toggle */}
      <div className="flex items-center gap-3 text-xs sm:text-sm md:gap-4 lg:gap-6">
        <ThemeToggle />

        {/* Rank badge */}
        {pathname === "/dashboard" && yourRank !== null ? (
          <div
            className="hidden rounded-lg px-3 py-1.5 sm:block"
            style={{
              backgroundColor: "var(--bg-card-inner)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--text-tertiary)" }}>
              YOUR RANK
            </p>
            <p className="text-sm font-bold" style={{ color: "var(--color-blue)" }}>
              #{yourRank}
              {streak.type !== "none" ? (
                <span
                  className="ml-2 text-xs font-semibold"
                  style={{ color: streak.type === "win" ? "var(--color-profit)" : "var(--color-loss)" }}
                >
                  | {streak.type === "win" ? "🔥" : "⚠️"} {streak.count}{" "}
                  {streak.type === "win" ? "Win" : "Loss"} Streak
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        {/* Portfolio value */}
        <div className="hidden sm:block">
          <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--text-tertiary)" }}>
            Portfolio Value
          </p>
          <p className="text-base font-bold lg:text-lg" style={{ color: "var(--text-primary)" }}>
            ₹{(summary?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* P&L */}
        <div>
          <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--text-tertiary)" }}>
            P&L
          </p>
          <p
            className="inline-flex items-center gap-1 text-sm font-bold sm:text-base lg:text-lg"
            style={{ color: pnl >= 0 ? "var(--color-profit)" : "var(--color-loss)" }}
          >
            {pnl >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            ₹{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </header>
  );
}
