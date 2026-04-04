"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Newspaper,
  Target,
  TrendingUp,
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
  symbol: string;
  image: string | null;
}

const cardClass = "rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 shadow-[inset_0_1px_0_#1a2744] transition duration-200 hover:brightness-110";

const moodColors: Record<string, string> = {
  Confident: "#22c55e",
  Anxious: "#ef4444",
  Neutral: "#6b7280",
  FOMO: "#f59e0b",
  Greedy: "#8b5cf6",
  Fearful: "#f97316",
  Unknown: "#9ca3af",
};

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

function normalizeMood(mood: string | null): keyof typeof moodColors {
  const normalized = (mood || "").trim().toLowerCase();
  const map: Record<string, keyof typeof moodColors> = {
    confident: "Confident",
    anxious: "Anxious",
    neutral: "Neutral",
    fomo: "FOMO",
    greedy: "Greedy",
    fearful: "Fearful",
  };

  return map[normalized] || "Unknown";
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
    const moodMap: Record<string, number> = {};

    for (const trade of trades) {
      if (trade.pnl === null) {
        continue;
      }

      const mood = normalizeMood(trade.mood);
      moodMap[mood] = (moodMap[mood] ?? 0) + trade.pnl;
    }

    return Object.entries(moodMap).map(([mood, pnl]) => ({
      mood,
      pnl,
      fill: moodColors[mood] ?? moodColors.Unknown,
    }));
  }, [trades]);

  const recentTrades = useMemo(() => trades.slice(0, 5), [trades]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-5 text-[#9ca3af]">Loading trading terminal...</div>
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
            ₹{summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className={`${cardClass} border-t-2 border-t-[#8b5cf6]`}>
          <div className="mb-3 inline-flex rounded-lg bg-[#24193a] p-2 text-[#8b5cf6]">
            <TrendingUp size={18} />
          </div>
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">Invested</p>
          <p className="mt-2 text-4xl font-bold text-[#c7cfe0]">
            ₹{summary.invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className={`${cardClass} border-t-2 ${summary.pnl >= 0 ? "border-t-[#22c55e]" : "border-t-[#ef4444]"}`}>
          <div className={`mb-3 inline-flex rounded-lg p-2 ${summary.pnl >= 0 ? "bg-[#123427] text-[#22c55e]" : "bg-[#391a1f] text-[#ef4444]"}`}>
            <Activity size={18} />
          </div>
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">P&amp;L</p>
          <p className={`mt-2 text-4xl font-bold ${summary.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            ₹{summary.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          <div className="h-[220px] w-full">
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
                  formatter={(value) => {
                    const rawValue = Array.isArray(value) ? value[0] : value;
                    const numericValue = Number(rawValue) || 0;
                    return [`₹${numericValue.toFixed(2)}`, "P&L"];
                  }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {moodVsPnlData.map((entry) => (
                    <Cell key={entry.mood} fill={entry.fill} />
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
                      No holdings yet.
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
                        <td className={`py-1.5 text-left font-bold ${holding.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{holding.stock}</td>
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
              <p className="text-sm text-[#9ca3af]">No trades yet.</p>
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
          <p className="text-sm text-[#9ca3af]">No recent news for your holdings</p>
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
                <div className="mb-2 inline-flex rounded-md bg-[#0f1929] px-2 py-0.5 text-[10px] font-semibold text-[#3b82f6]">
                  {item.symbol}
                </div>
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
