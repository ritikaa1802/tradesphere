"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

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

        if (!portfolioResponse.ok) {
          return;
        }

        const data = (await portfolioResponse.json()) as PortfolioSummary;
        if (isMounted) {
          setSummary(data);
        }

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
        // Ignore top bar polling errors and keep last known values.
      }
    }

    loadSummary();
    const intervalId = setInterval(loadSummary, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [pathname]);

  const title = useMemo(() => getTitle(pathname), [pathname]);
  const pnl = summary?.pnl ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1a2744] bg-[#0a0f1a]/95 px-2 backdrop-blur sm:px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#1a2744] bg-[#0d1421] text-[#9ca3af] hover:text-white md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-9 w-9 items-center justify-center rounded-md border border-[#1a2744] bg-[#0d1421] text-[#9ca3af] hover:text-white md:inline-flex"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <h1 className="text-sm font-semibold tracking-wide text-white md:text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-3 text-xs sm:text-sm md:gap-4 lg:gap-6">
        {pathname === "/dashboard" && yourRank !== null ? (
          <div className="hidden rounded-md border border-[#1a2744] bg-[#0d1421] px-2 py-1 sm:block">
            <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">YOUR RANK</p>
            <p className="text-sm font-bold text-[#3b82f6]">
              #{yourRank}
              {streak.type !== "none" ? (
                <span className={`ml-2 text-xs font-semibold ${streak.type === "win" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  | {streak.type === "win" ? "🔥" : "⚠️"} {streak.count} {streak.type === "win" ? "Win" : "Loss"} Streak
                </span>
              ) : null}
            </p>
          </div>
        ) : null}
        <div className="hidden sm:block">
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Portfolio Value</p>
          <p className="text-base font-bold text-white lg:text-lg">
            ₹{(summary?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">P&amp;L</p>
          <p className={`inline-flex items-center gap-1 text-sm font-bold sm:text-base lg:text-lg ${pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            {pnl >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            ₹{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </header>
  );
}
