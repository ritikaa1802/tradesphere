"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProGate from "@/components/ProGate";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Holding {
  stock: string;
  quantity: number;
  avgBuyPrice: number;
  invested: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
}

interface PortfolioSummary {
  balance: number;
  invested: number;
  pnl: number;
  pnlPercentage: number;
  holdings: Holding[];
  lastUpdated: string;
}

interface PortfolioHistoryPoint {
  date: string;
  portfolioValue: number;
}

interface TradeItem {
  id: string;
  stock: string;
  type: string;
  price: number;
  quantity: number;
  pnl: number | null;
  mood: string | null;
  createdAt: string;
}

interface AnalyticsSummary {
  winRate: number;
}

interface MissionSummary {
  missions: Array<{
    missionNumber: number;
    title: string;
    completed: boolean;
  }>;
  completedCount: number;
  totalMissions: number;
  currentMissionNumber: number;
}

type IndexRow = {
  name: string;
  value: number;
  open: number;
};

type SortKey = "ltp" | "pnl" | "pnlPercent";
type SortOrder = "asc" | "desc";

const ALL_MOODS = ["Confident", "Anxious", "Neutral", "FOMO", "Greedy", "Fearful"] as const;

function normalizeMoodLabel(mood: string | null): (typeof ALL_MOODS)[number] {
  const normalized = (mood || "").trim().toLowerCase();
  const moodMap: Record<string, (typeof ALL_MOODS)[number]> = {
    confident: "Confident",
    anxious: "Anxious",
    neutral: "Neutral",
    fomo: "FOMO",
    greedy: "Greedy",
    fearful: "Fearful",
  };

  return moodMap[normalized] || "Neutral";
}

function fearGreedLabel(score: number): string {
  if (score <= 20) return "Extreme Fear";
  if (score <= 40) return "Fear";
  if (score <= 60) return "Neutral";
  if (score <= 80) return "Greed";
  return "Extreme Greed";
}

function formatMoney(value: number): string {
  return `₹${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function changeColor(value: number): string {
  return value >= 0 ? "text-emerald-400" : "text-rose-400";
}

export default function DashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [missions, setMissions] = useState<MissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [indices, setIndices] = useState<IndexRow[]>([
    { name: "NIFTY 50", value: 18181.75, open: 18285.9 },
    { name: "SENSEX", value: 61560.64, open: 61931.31 },
  ]);
  const [sortKey, setSortKey] = useState<SortKey>("ltp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedHoldingSymbol, setSelectedHoldingSymbol] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      try {
        setError("");

        const [summaryRes, historyRes, tradesRes, analyticsRes, missionsRes] = await Promise.all([
          fetch("/api/portfolio", { cache: "no-store" }),
          fetch("/api/portfolio/history", { cache: "no-store" }),
          fetch("/api/trades", { cache: "no-store" }),
          fetch("/api/analytics/summary", { cache: "no-store" }),
          fetch("/api/missions", { cache: "no-store" }),
        ]);

        if (!summaryRes.ok || !historyRes.ok || !tradesRes.ok || !analyticsRes.ok || !missionsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const [summaryData, historyData, tradesData, analyticsData, missionData] = (await Promise.all([
          summaryRes.json(),
          historyRes.json(),
          tradesRes.json(),
          analyticsRes.json(),
          missionsRes.json(),
        ])) as [PortfolioSummary, PortfolioHistoryPoint[], TradeItem[], AnalyticsSummary, MissionSummary];

        if (!mounted) {
          return;
        }

        setSummary(summaryData);
        setHistory(historyData);
        setTrades(tradesData);
        setAnalytics(analyticsData);
        setMissions(missionData);
      } catch {
        if (mounted) {
          setError("Unable to load dashboard data right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();
    const refreshId = setInterval(loadDashboardData, 12000);

    return () => {
      mounted = false;
      clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    const tickId = setInterval(() => {
      setIndices((prev) =>
        prev.map((row) => {
          const drift = row.value * (Math.random() - 0.5) * 0.0008;
          const nextValue = row.value + drift;
          return { ...row, value: nextValue };
        }),
      );
    }, 1600);

    return () => clearInterval(tickId);
  }, []);

  const sortedHoldingsPreview = useMemo(() => {
    const base = [...(summary?.holdings || [])];
    const direction = sortOrder === "asc" ? 1 : -1;

    base.sort((a, b) => {
      const pnlPercentA = a.invested > 0 ? (a.pnl / a.invested) * 100 : 0;
      const pnlPercentB = b.invested > 0 ? (b.pnl / b.invested) * 100 : 0;

      const valueA = sortKey === "ltp" ? a.currentPrice : sortKey === "pnl" ? a.pnl : pnlPercentA;
      const valueB = sortKey === "ltp" ? b.currentPrice : sortKey === "pnl" ? b.pnl : pnlPercentB;

      return (valueA - valueB) * direction;
    });

    return base.slice(0, 5);
  }, [summary?.holdings, sortKey, sortOrder]);

  useEffect(() => {
    if (sortedHoldingsPreview.length === 0) {
      setSelectedHoldingSymbol(null);
      setSelectedIndex(0);
      return;
    }

    if (!selectedHoldingSymbol) {
      setSelectedHoldingSymbol(sortedHoldingsPreview[0].stock);
      setSelectedIndex(0);
      return;
    }

    const matchedIndex = sortedHoldingsPreview.findIndex((holding) => holding.stock === selectedHoldingSymbol);
    if (matchedIndex === -1) {
      setSelectedHoldingSymbol(sortedHoldingsPreview[0].stock);
      setSelectedIndex(0);
      return;
    }

    if (matchedIndex !== selectedIndex) {
      setSelectedIndex(matchedIndex);
    }
  }, [sortedHoldingsPreview, selectedHoldingSymbol, selectedIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (sortedHoldingsPreview.length === 0) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => {
          const next = Math.min(sortedHoldingsPreview.length - 1, prev + 1);
          setSelectedHoldingSymbol(sortedHoldingsPreview[next].stock);
          return next;
        });
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => {
          const next = Math.max(0, prev - 1);
          setSelectedHoldingSymbol(sortedHoldingsPreview[next].stock);
          return next;
        });
      }

      if (event.key === "Enter") {
        const selected = sortedHoldingsPreview[selectedIndex];
        if (!selected) {
          return;
        }
        event.preventDefault();
        router.push(`/trade?symbol=${encodeURIComponent(selected.stock.toUpperCase())}`);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, selectedIndex, sortedHoldingsPreview]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortOrder("desc");
  }

  function getSortArrow(column: SortKey): string {
    if (sortKey !== column) {
      return "↑↓";
    }
    return sortOrder === "asc" ? "↑" : "↓";
  }

  const moodVsPnlData = useMemo(() => {
    const moodMap: Record<string, { total: number; count: number }> = {};

    for (const trade of trades) {
      if (trade.pnl === null) {
        continue;
      }

      const mood = normalizeMoodLabel(trade.mood);
      if (!moodMap[mood]) {
        moodMap[mood] = { total: 0, count: 0 };
      }

      moodMap[mood].total += trade.pnl;
      moodMap[mood].count += 1;
    }

    return ALL_MOODS.map((mood) => {
      const data = moodMap[mood];
      const avgPnl = data && data.count > 0 ? data.total / data.count : 0;
      return { mood, pnl: avgPnl };
    });
  }, [trades]);

  const fearGreedScore = useMemo(() => {
    const moods = trades.map((trade) => normalizeMoodLabel(trade.mood));
    if (moods.length === 0) {
      return 50;
    }

    let score = 0;
    for (const mood of moods) {
      if (mood === "Confident" || mood === "Greedy") score += 1;
      if (mood === "Anxious" || mood === "Fearful") score -= 1;
    }

    const normalized = (score / moods.length) * 50 + 50;
    return Math.max(0, Math.min(100, normalized));
  }, [trades]);

  const dayPnl = useMemo(() => {
    if (history.length < 2) return 0;
    const latest = history[history.length - 1]?.portfolioValue ?? 0;
    const prev = history[history.length - 2]?.portfolioValue ?? latest;
    return latest - prev;
  }, [history]);

  const bestPerformer = useMemo(() => {
    const holdings = summary?.holdings ?? [];
    if (!holdings.length) return null;
    return [...holdings].sort((a, b) => {
      const aPct = a.invested > 0 ? (a.pnl / a.invested) * 100 : 0;
      const bPct = b.invested > 0 ? (b.pnl / b.invested) * 100 : 0;
      return bPct - aPct;
    })[0];
  }, [summary?.holdings]);

  const worstPerformer = useMemo(() => {
    const holdings = summary?.holdings ?? [];
    if (!holdings.length) return null;
    return [...holdings].sort((a, b) => {
      const aPct = a.invested > 0 ? (a.pnl / a.invested) * 100 : 0;
      const bPct = b.invested > 0 ? (b.pnl / b.invested) * 100 : 0;
      return aPct - bPct;
    })[0];
  }, [summary?.holdings]);

  const currentMission = useMemo(() => {
    if (!missions) return null;
    return missions.missions.find((mission) => mission.missionNumber === missions.currentMissionNumber) || null;
  }, [missions]);

  if (loading) {
    return (
      <section className="space-y-3 text-white">
        <div className="h-14 animate-pulse border-b border-[#1a2744]" />
        <div className="h-44 animate-pulse border-b border-[#1a2744]" />
        <div className="h-32 animate-pulse border-b border-[#1a2744]" />
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section className="border-b border-[#1a2744] py-3 text-sm text-rose-400">
        {error || "Dashboard unavailable."}
      </section>
    );
  }

  return (
    <section className="space-y-3 text-white">
      <div className="border-b border-[#1a2744] pb-3">
        <div className="grid grid-cols-2 gap-3 text-right md:grid-cols-5">
          <div className="text-left md:text-right">
            <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Balance</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums">{formatMoney(summary.balance)}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Invested</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums">{formatMoney(summary.invested)}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Day P&amp;L</p>
            <p className={`mt-0.5 text-xl font-semibold tabular-nums ${changeColor(dayPnl)}`}>
              {dayPnl >= 0 ? "+" : "-"}{formatMoney(dayPnl)}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Total P&amp;L</p>
            <p className={`mt-0.5 text-xl font-semibold tabular-nums ${changeColor(summary.pnl)}`}>
              {summary.pnl >= 0 ? formatMoney(summary.pnl) : `-${formatMoney(summary.pnl)}`}
              <span className="ml-2 text-sm">({summary.pnlPercentage.toFixed(2)}%)</span>
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Win Rate</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums">{(analytics?.winRate ?? 0).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 border-b border-[#1a2744] pb-2 text-xs md:grid-cols-2">
        <div className="grid grid-cols-[1fr_auto] items-center border-b border-[#1a2744] py-1">
          <span className="text-[#9ca3af]">Best Performer</span>
          <span className="text-right tabular-nums text-emerald-400 font-semibold">
            {bestPerformer
              ? `${bestPerformer.stock} (${((bestPerformer.pnl / Math.max(bestPerformer.invested, 1)) * 100).toFixed(2)}%)`
              : "--"}
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-center border-b border-[#1a2744] py-1">
          <span className="text-[#9ca3af]">Worst Performer</span>
          <span className="text-right tabular-nums text-rose-400 font-semibold">
            {worstPerformer
              ? `${worstPerformer.stock} (${((worstPerformer.pnl / Math.max(worstPerformer.invested, 1)) * 100).toFixed(2)}%)`
              : "--"}
          </span>
        </div>
      </div>

      {missions && currentMission ? (
        <div className="rounded-xl border border-[#1a2744] bg-[#0f1929] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#9ca3af]">Mission Progress</p>
              <p className="mt-1 text-sm font-semibold text-white">
                Mission {currentMission.missionNumber}/{missions.totalMissions}: {currentMission.title}
              </p>
            </div>
            <Link href="/missions" className="text-xs font-semibold text-[#60a5fa] hover:text-[#93c5fd]">
              Open Trail →
            </Link>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1a2744]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
              style={{ width: `${(missions.completedCount / Math.max(1, missions.totalMissions)) * 100}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="border-b border-[#1a2744] pb-2">
        <div className="mb-1 flex items-center justify-between text-xs">
          <h3 className="font-semibold text-[#d1d5db]">Holdings Preview</h3>
          <Link href="/history" className="text-[#60a5fa] hover:text-[#93c5fd]">
            View All Holdings →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[620px] w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a2744] text-[#9ca3af]">
                <th className="py-1 text-left font-medium">Stock</th>
                <th className="py-1 text-right font-medium">Qty</th>
                <th className="py-1 text-right font-medium">Avg Price</th>
                <th className="py-1 text-right font-medium">Alloc %</th>
                <th className="py-1 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("ltp")}
                    className={`inline-flex items-center gap-1 ${sortKey === "ltp" ? "text-[#d1d5db]" : "text-[#9ca3af]"}`}
                  >
                    LTP <span className="text-[10px]">{getSortArrow("ltp")}</span>
                  </button>
                </th>
                <th className="py-1 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("pnl")}
                    className={`inline-flex items-center gap-1 ${sortKey === "pnl" ? "text-[#d1d5db]" : "text-[#9ca3af]"}`}
                  >
                    P&amp;L <span className="text-[10px]">{getSortArrow("pnl")}</span>
                  </button>
                </th>
                <th className="py-1 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("pnlPercent")}
                    className={`inline-flex items-center gap-1 ${sortKey === "pnlPercent" ? "text-[#d1d5db]" : "text-[#9ca3af]"}`}
                  >
                    P&amp;L % <span className="text-[10px]">{getSortArrow("pnlPercent")}</span>
                  </button>
                </th>
                <th className="py-1 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedHoldingsPreview.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-3 text-center text-[#9ca3af]">
                    No holdings yet. Place your first trade.
                  </td>
                </tr>
              ) : (
                sortedHoldingsPreview.map((holding, index) => {
                  const pnlPercent = holding.invested > 0 ? (holding.pnl / holding.invested) * 100 : 0;
                  const allocationPercent = summary.invested > 0 ? (holding.invested / summary.invested) * 100 : 0;
                  const isSelected = selectedHoldingSymbol === holding.stock;
                  return (
                    <tr
                      key={holding.stock}
                      className={`border-b border-[#1a2744] cursor-pointer transition ${
                        isSelected ? "bg-[#16253f]" : "hover:bg-[#0f1929]/45"
                      }`}
                      onMouseEnter={() => {
                        setSelectedHoldingSymbol(holding.stock);
                        setSelectedIndex(index);
                      }}
                      onClick={() => router.push(`/trade?symbol=${encodeURIComponent(holding.stock.toUpperCase())}`)}
                    >
                      <td className="py-1.5 font-semibold text-[#e5e7eb]">{holding.stock}</td>
                      <td className="py-1.5 text-right tabular-nums text-[#d1d5db]">{holding.quantity}</td>
                      <td className="py-1.5 text-right tabular-nums text-[#d1d5db]">₹{holding.avgBuyPrice.toFixed(2)}</td>
                      <td className="py-1.5 text-right tabular-nums text-[#d1d5db]">{allocationPercent.toFixed(2)}%</td>
                      <td className="py-1.5 text-right tabular-nums text-[#e5e7eb]">₹{holding.currentPrice.toFixed(2)}</td>
                      <td className={`py-1.5 text-right tabular-nums font-semibold ${changeColor(holding.pnl)}`}>
                        {holding.pnl >= 0 ? "+" : ""}₹{holding.pnl.toFixed(2)}
                      </td>
                      <td className={`py-1.5 text-right tabular-nums font-semibold ${changeColor(pnlPercent)}`}>
                        {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                      </td>
                      <td className="py-1.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            className="border border-emerald-700/70 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-900/20"
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(`/trade?symbol=${encodeURIComponent(holding.stock.toUpperCase())}&side=buy`);
                            }}
                          >
                            Buy
                          </button>
                          <button
                            type="button"
                            className="border border-rose-700/70 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300 hover:bg-rose-900/20"
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(`/trade?symbol=${encodeURIComponent(holding.stock.toUpperCase())}&side=sell`);
                            }}
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-b border-[#1a2744] pb-2">
        <h3 className="mb-1 text-xs font-semibold text-[#d1d5db]">Market Snapshot</h3>
        <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
          {indices.map((row) => {
            const changePercent = ((row.value - row.open) / row.open) * 100;
            const positive = changePercent >= 0;
            return (
              <div key={row.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-[#1a2744] py-1">
                <p className="text-[#cbd5e1]">{row.name}</p>
                <p className="text-right tabular-nums text-[#f8fafc]">{row.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className={`text-right tabular-nums font-semibold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                  {positive ? "+" : ""}{changePercent.toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-b border-[#1a2744] pb-1">
        <h3 className="mb-1 text-xs font-semibold text-[#d1d5db]">Portfolio Trend</h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer>
            <AreaChart data={history} margin={{ top: 2, right: 6, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1a2744" strokeDasharray="2 2" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} minTickGap={16} />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 10 }}
                width={48}
                tickFormatter={(value: number) => `₹${Math.round(value / 1000)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#0d1117", border: "1px solid #1a2744", color: "#ffffff" }}
                formatter={(value) => {
                  const raw = Array.isArray(value) ? value[0] : value;
                  const numeric = Number(raw) || 0;
                  return [`₹${numeric.toLocaleString()}`, "Value"];
                }}
              />
              <Area type="monotone" dataKey="portfolioValue" stroke="#3b82f6" strokeWidth={1.8} fill="url(#portfolioGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ProGate>
        <div className="grid grid-cols-1 gap-3 border-b border-[#1a2744] pb-2 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold text-[#d1d5db]">Fear &amp; Greed</h3>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-semibold tabular-nums text-white">{fearGreedScore.toFixed(0)}</p>
              <p className="text-xs text-[#9ca3af]">{fearGreedLabel(fearGreedScore)}</p>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-[#1a2744]">
              <div
                className={`h-full rounded ${fearGreedScore >= 60 ? "bg-emerald-500" : fearGreedScore <= 40 ? "bg-rose-500" : "bg-amber-500"}`}
                style={{ width: `${fearGreedScore}%` }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#d1d5db]">Mood vs P&amp;L</h3>
            <div className="h-[120px] w-full">
              <ResponsiveContainer>
                <BarChart data={moodVsPnlData} margin={{ top: 6, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="#1a2744" strokeDasharray="2 2" />
                  <XAxis dataKey="mood" stroke="#9ca3af" tick={{ fontSize: 9 }} interval={0} minTickGap={10} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 9 }} width={36} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0d1117", border: "1px solid #1a2744", color: "#ffffff" }}
                    formatter={(value) => {
                      const raw = Array.isArray(value) ? value[0] : value;
                      const numeric = Number(raw) || 0;
                      return [`₹${numeric.toFixed(2)}`, "Avg P&L"];
                    }}
                  />
                  <Bar dataKey="pnl" radius={[2, 2, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </ProGate>
    </section>
  );
}
