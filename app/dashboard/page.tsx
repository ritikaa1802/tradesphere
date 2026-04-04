"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Flame,
  Gauge,
  LineChart as LineChartIcon,
  Newspaper,
  Target,
  TrendingUp,
  WalletCards,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

interface NewsItem {
  headline: string;
  source: string;
  url: string;
  datetime: string;
  image: string | null;
}

const cardClass = "rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 shadow-[inset_0_1px_0_#1a2744] transition duration-200 hover:brightness-110";

const MOOD_COLORS: Record<string, string> = {
  Confident: "#22c55e",
  Anxious: "#ef4444",
  Neutral: "#6b7280",
  FOMO: "#f59e0b",
  Greedy: "#8b5cf6",
  Fearful: "#f97316",
};

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

function timeAgo(isoDate: string) {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AnimatedNumber({
  value,
  decimals = 2,
  prefix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    const from = displayValue;
    const to = value;

    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(from + (to - from) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

function fearGreedLabel(score: number): string {
  if (score <= 20) return "Extreme Fear";
  if (score <= 40) return "Fear";
  if (score <= 60) return "Neutral";
  if (score <= 80) return "Greed";
  return "Extreme Greed";
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setError("");
        const [summaryRes, historyRes, tradesRes, analyticsRes, newsRes] = await Promise.all([
          fetch("/api/portfolio", { cache: "no-store" }),
          fetch("/api/portfolio/history", { cache: "no-store" }),
          fetch("/api/trades", { cache: "no-store" }),
          fetch("/api/analytics/summary", { cache: "no-store" }),
          fetch("/api/news", { cache: "no-store" }),
        ]);

        if (!summaryRes.ok || !historyRes.ok || !tradesRes.ok || !analyticsRes.ok || !newsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const [summaryData, historyData, tradesData, analyticsData, newsData] = (await Promise.all([
          summaryRes.json(),
          historyRes.json(),
          tradesRes.json(),
          analyticsRes.json(),
          newsRes.json(),
        ])) as [PortfolioSummary, PortfolioHistoryPoint[], TradeItem[], AnalyticsSummary, NewsItem[]];

        if (!isMounted) {
          return;
        }

        setSummary(summaryData);
        setHistory(historyData);
        setTrades(tradesData);
        setAnalytics(analyticsData);
        setNews(newsData);
      } catch {
        if (isMounted) {
          setError("Unable to load dashboard data right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();
    const refreshId = setInterval(loadDashboardData, 30000);

    return () => {
      isMounted = false;
      clearInterval(refreshId);
    };
  }, []);

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

      return {
      mood,
      pnl: avgPnl,
      };
    });
  }, [trades]);

  const recentTrades = useMemo(() => trades.slice(0, 5), [trades]);

  const fearGreedScore = useMemo(() => {
    const moods = trades.map((trade) => normalizeMoodLabel(trade.mood));
    if (moods.length === 0) {
      return 50;
    }

    let score = 0;
    for (const mood of moods) {
      if (mood === "Confident" || mood === "Greedy") {
        score += 1;
      } else if (mood === "Anxious" || mood === "Fearful") {
        score -= 1;
      }
    }

    const normalized = ((score / moods.length) * 50) + 50;
    return Math.max(0, Math.min(100, normalized));
  }, [trades]);

  const streakSummary = useMemo(() => {
    const sellTrades = [...trades]
      .filter((trade) => trade.pnl !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (sellTrades.length === 0) {
      return { type: "none" as const, count: 0 };
    }

    const first = sellTrades[0].pnl ?? 0;
    const isWin = first > 0;
    const isLoss = first < 0;
    if (!isWin && !isLoss) {
      return { type: "none" as const, count: 0 };
    }

    let count = 0;
    for (const trade of sellTrades) {
      const pnl = trade.pnl ?? 0;
      if ((isWin && pnl > 0) || (isLoss && pnl < 0)) {
        count += 1;
      } else {
        break;
      }
    }

    return { type: isWin ? "win" as const : "loss" as const, count };
  }, [trades]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-stat-${index}`} className="h-32 animate-pulse rounded-xl border border-[#1a2744] bg-[#0d1421]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <div className="h-[300px] animate-pulse rounded-xl border border-[#1a2744] bg-[#0d1421] xl:col-span-3" />
          <div className="h-[300px] animate-pulse rounded-xl border border-[#1a2744] bg-[#0d1421] xl:col-span-2" />
        </div>
        <div className="h-[220px] animate-pulse rounded-xl border border-[#1a2744] bg-[#0d1421]" />
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-5 text-[#ef4444]">{error || "Dashboard unavailable."}</div>
      </section>
    );
  }

  return (
    <section className="space-y-4 text-white">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className={`${cardClass} border-t-2 border-t-[#3b82f6]`}>
          <div className="mb-3 inline-flex rounded-lg bg-[#14213a] p-2 text-[#3b82f6]">
            <Wallet size={18} />
          </div>
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">Balance</p>
          <p className="mt-2 text-4xl font-bold text-white">
            <AnimatedNumber value={summary.balance} prefix="₹" />
          </p>
        </div>

        <div className={`${cardClass} border-t-2 border-t-[#8b5cf6]`}>
          <div className="mb-3 inline-flex rounded-lg bg-[#24193a] p-2 text-[#8b5cf6]">
            <TrendingUp size={18} />
          </div>
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">Invested</p>
          <p className="mt-2 text-4xl font-bold text-[#c7cfe0]">
            <AnimatedNumber value={summary.invested} prefix="₹" />
          </p>
        </div>

        <div className={`${cardClass} border-t-2 ${summary.pnl >= 0 ? "border-t-[#22c55e]" : "border-t-[#ef4444]"}`}>
          <div className={`mb-3 inline-flex rounded-lg p-2 ${summary.pnl >= 0 ? "bg-[#123427] text-[#22c55e]" : "bg-[#391a1f] text-[#ef4444]"}`}>
            <Activity size={18} />
          </div>
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">P&amp;L</p>
          <p className={`mt-2 text-4xl font-bold ${summary.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            <AnimatedNumber value={summary.pnl} prefix="₹" />
          </p>
          <p className={`mt-1 text-sm font-semibold ${summary.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{summary.pnlPercentage.toFixed(2)}%</p>
        </div>

        <div className={`${cardClass} border-t-2 border-t-[#3b82f6]`}>
          <div className="mb-3 inline-flex rounded-lg bg-[#14213a] p-2 text-[#3b82f6]">
            <Target size={18} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-[#9ca3af]">Win Rate</p>
            <p className="text-lg font-bold text-white">{(analytics?.winRate ?? 0).toFixed(1)}%</p>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1a2744]">
            <div
              className="h-full rounded-full bg-[#3b82f6] transition-all"
              style={{ width: `${Math.min(100, Math.max(0, analytics?.winRate ?? 0))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className={`${cardClass} xl:col-span-3`}>
          <div className="mb-2 flex items-center gap-2">
            <Gauge size={16} className="text-[#3b82f6]" />
            <h3 className="text-sm font-semibold text-white">Fear &amp; Greed Meter</h3>
          </div>
          <div className="relative mx-auto mt-4 h-28 w-56">
            <svg viewBox="0 0 220 120" className="h-full w-full">
              <path d="M20 100 A90 90 0 0 1 200 100" fill="none" stroke="#1a2744" strokeWidth="14" strokeLinecap="round" />
              <path
                d="M20 100 A90 90 0 0 1 200 100"
                fill="none"
                stroke={fearGreedScore >= 60 ? "#22c55e" : fearGreedScore <= 40 ? "#ef4444" : "#f59e0b"}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${(fearGreedScore / 100) * 282.7} 282.7`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <p className="text-2xl font-bold text-white">{fearGreedScore.toFixed(0)}</p>
              <p className="text-xs text-[#9ca3af]">{fearGreedLabel(fearGreedScore)}</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} xl:col-span-2`}>
          <div className="mb-2 flex items-center gap-2">
            <LineChartIcon size={16} className="text-[#3b82f6]" />
            <h3 className="text-sm font-semibold text-white">Trading Streak</h3>
          </div>
          {streakSummary.type === "none" ? (
            <p className="mt-4 text-sm text-[#9ca3af]">No realized streak yet. Close some trades to start a streak.</p>
          ) : streakSummary.type === "win" ? (
            <div className="mt-4">
              <p className="text-3xl font-bold text-[#22c55e]">{streakSummary.count} Win{streakSummary.count > 1 ? "s" : ""} 🔥</p>
              <p className="mt-1 text-sm text-[#9ca3af]">You are on a winning run. Keep risk in check.</p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-3xl font-bold text-[#ef4444]">{streakSummary.count} Loss{streakSummary.count > 1 ? "es" : ""}</p>
              <p className="mt-1 text-sm text-[#9ca3af]">Pause and review your recent setup quality.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className={`${cardClass} xl:col-span-3`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Portfolio Value Over Time</h2>
            <p className="text-xs text-[#9ca3af]">Net curve</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a2744" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                  domain={["auto", "auto"]}
                  tickFormatter={(value: number) => `₹${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1117",
                    border: "1px solid #1a2744",
                    color: "#ffffff",
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => {
                    const rawValue = Array.isArray(value) ? value[0] : value;
                    const numericValue = Number(rawValue) || 0;
                    return [`₹${numericValue.toLocaleString()}`, "Value"];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#portfolioGradient)"
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${cardClass} xl:col-span-2`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Mood vs P&amp;L</h2>
            <p className="text-xs text-[#9ca3af]">Behavior impact</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={moodVsPnlData}>
                <CartesianGrid stroke="#1a2744" strokeDasharray="3 3" />
                <XAxis dataKey="mood" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1117",
                    border: "1px solid #1f2937",
                    color: "#ffffff",
                  }}
                  labelFormatter={(label) => `Mood: ${String(label)}`}
                  formatter={(value) => {
                    const rawValue = Array.isArray(value) ? value[0] : value;
                    const numericValue = Number(rawValue) || 0;
                    return [`₹${numericValue.toFixed(2)}`, "Avg P&L"];
                  }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]} minPointSize={2}>
                  {moodVsPnlData.map((entry) => (
                    <Cell
                      key={entry.mood}
                      fill={MOOD_COLORS[entry.mood] || "#6b7280"}
                      fillOpacity={entry.pnl === 0 ? 0.3 : 1}
                      stroke={MOOD_COLORS[entry.mood] || "#6b7280"}
                      strokeOpacity={entry.pnl === 0 ? 0.4 : 0}
                      strokeWidth={entry.pnl === 0 ? 1 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className={`${cardClass} xl:col-span-3`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Holdings</h2>
            <p className="text-xs text-[#9ca3af]">
              Last updated: {new Date(summary.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a2744] text-[#9ca3af]">
                  <th className="py-2 text-left font-medium">Stock</th>
                  <th className="py-2 text-right font-medium">Qty</th>
                  <th className="py-2 text-right font-medium">Avg Buy</th>
                  <th className="py-2 text-right font-medium">Live Price</th>
                  <th className="py-2 text-right font-medium">P&amp;L</th>
                  <th className="py-2 text-right font-medium">P&amp;L %</th>
                </tr>
              </thead>
              <tbody>
                {summary.holdings.length === 0 ? (
                  <tr>
                    <td className="py-4 text-[#9ca3af]" colSpan={6}>
                      <div className="flex flex-col items-center gap-2 py-2 text-center">
                        <WalletCards size={20} className="text-[#3b82f6]" />
                        <p>No holdings yet. Place your first trade to build positions.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  summary.holdings.map((holding, index) => {
                    const pnlPercent = holding.invested > 0 ? (holding.pnl / holding.invested) * 100 : 0;
                    return (
                      <tr
                        key={holding.stock}
                        className={`border-b border-[#1a2744] transition hover:bg-[#0f1929] ${index % 2 === 0 ? "bg-[#0d1421]" : "bg-[#0f1727]"}`}
                      >
                        <td className={`py-1.5 text-left font-bold ${holding.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          <Link href={`/stock/${encodeURIComponent(holding.stock.toUpperCase())}`} className="hover:underline">
                            {holding.stock}
                          </Link>
                        </td>
                        <td className="py-1.5 text-right text-[#d1d5db]">{holding.quantity}</td>
                        <td className="py-1.5 text-right text-[#d1d5db]">₹{holding.avgBuyPrice.toFixed(2)}</td>
                        <td className="py-1.5 text-right font-semibold text-[#3b82f6]">₹{holding.currentPrice.toFixed(2)}</td>
                        <td className={`py-1.5 text-right font-semibold ${holding.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          <span className="inline-flex items-center gap-1">
                            {holding.pnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            ₹{holding.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-1.5 text-right">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              pnlPercent >= 0 ? "bg-[#123427] text-[#22c55e]" : "bg-[#3f1d1d] text-[#ef4444]"
                            }`}
                          >
                            {pnlPercent.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${cardClass} xl:col-span-2`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Trades</h2>
            <p className="text-xs text-[#9ca3af]">Last 5</p>
          </div>
          <div className="space-y-2">
            {recentTrades.length === 0 ? (
              <div className="rounded-lg border border-[#1a2744] bg-[#0a0f1a] p-4 text-center text-sm text-[#9ca3af]">
                <p>No trades yet. Start with your first order.</p>
                <Link href="/trade" className="mt-2 inline-block text-xs font-semibold text-[#3b82f6] hover:text-[#60a5fa]">
                  Go to Trade →
                </Link>
              </div>
            ) : (
              recentTrades.map((trade) => (
                <div key={trade.id} className="rounded-lg border border-[#1a2744] bg-[#0a0f1a] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{trade.stock}</p>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        trade.type.toLowerCase() === "buy"
                          ? "bg-[#14532d] text-[#22c55e]"
                          : "bg-[#7f1d1d] text-[#ef4444]"
                      }`}
                    >
                      {trade.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <p className="text-[#9ca3af]">
                      ₹{trade.price.toFixed(2)} x {trade.quantity}
                    </p>
                    <p className={`inline-flex items-center gap-1 ${(trade.pnl ?? 0) >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {(trade.pnl ?? 0) >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {trade.pnl === null ? "-" : `₹${trade.pnl.toFixed(2)}`}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-[#6b7280]">{timeAgo(trade.createdAt)}</p>
                </div>
              ))
            )}
          </div>

          <Link href="/history" className="mt-3 inline-block text-xs font-semibold text-[#3b82f6] hover:text-[#60a5fa]">
            View full history →
          </Link>
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-3 flex items-center gap-2">
          <Newspaper size={16} className="text-[#3b82f6]" />
          <h2 className="text-sm font-semibold text-white">Market News</h2>
        </div>

        {news.length === 0 ? (
          <p className="text-sm text-[#9ca3af]">No recent market news</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {news.map((item) => (
              <a
                key={`${item.url}-${item.datetime}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-[#1a2744] bg-[#0d1421] p-3 transition hover:border-[#3b82f6] hover:brightness-110"
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.headline} className="mb-2 h-28 w-full rounded-md object-cover" />
                ) : null}
                <p className="line-clamp-2 text-sm font-semibold text-white">{item.headline}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#9ca3af]">
                  <span>{item.source}</span>
                  <span>{timeAgo(item.datetime)}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
