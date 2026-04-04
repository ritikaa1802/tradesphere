"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface PortfolioSummary {
  balance: number;
  pnl: number;
}

function getTitle(pathname: string): string {
  const titleMap: Record<string, string> = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/trade": "Trade",
    "/history": "History",
    "/mood": "TradeMind",
    "/mistakes": "Mistakes",
    "/analytics": "Analytics",
    "/ai-coach": "AI Coach",
    "/login": "Login",
    "/signup": "Sign Up",
    "/onboarding": "Onboarding",
  };

  return titleMap[pathname] || "TradeSphere";
}

export default function TopBar() {
  const pathname = usePathname();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const response = await fetch("/api/portfolio", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as PortfolioSummary;
        if (isMounted) {
          setSummary(data);
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
