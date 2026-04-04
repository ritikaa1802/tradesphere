"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface PortfolioSummary {
  balance: number;
  pnl: number;
}

interface LeaderboardSummary {
  yourRank: number | null;
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
    "/settings": "Settings",
    "/login": "Login",
    "/signup": "Sign Up",
    "/onboarding": "Onboarding",
  };

  return titleMap[pathname] || "TradeSphere";
}

export default function TopBar() {
  const pathname = usePathname();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [yourRank, setYourRank] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const [portfolioResponse, leaderboardResponse] = await Promise.all([
          fetch("/api/portfolio", { cache: "no-store" }),
          fetch("/api/leaderboard", { cache: "no-store" }),
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
    <header className="fixed left-[220px] right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#1a2744] bg-[#0a0f1a] px-6">
      <h1 className="text-sm font-semibold tracking-wide text-white">{title}</h1>
      <div className="flex items-center gap-6 text-sm">
        {pathname === "/dashboard" && yourRank !== null ? (
          <div className="rounded-md border border-[#1a2744] bg-[#0d1421] px-2 py-1">
            <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Your Rank</p>
            <p className="text-sm font-bold text-[#3b82f6]">#{yourRank}</p>
          </div>
        ) : null}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Portfolio Value</p>
          <p className="text-lg font-bold text-white">
            ₹{(summary?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">P&amp;L</p>
          <p className={`inline-flex items-center gap-1 text-lg font-bold ${pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            {pnl >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            ₹{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </header>
  );
}
