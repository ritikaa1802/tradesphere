"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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

const cardClass = "rounded-xl border border-[#1f2937] bg-[#111827] p-5";

const moodColors: Record<string, string> = {
  Confident: "#22c55e",
  Anxious: "#ef4444",
  Neutral: "#3b82f6",
  FOMO: "#f59e0b",
  Greedy: "#14b8a6",
  Fearful: "#8b5cf6",
  Unknown: "#9ca3af",
};

function timeAgo(isoDate: string) {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setError("");
        const [summaryRes, historyRes, tradesRes, analyticsRes] = await Promise.all([
          fetch("/api/portfolio", { cache: "no-store" }),
          fetch("/api/portfolio/history", { cache: "no-store" }),
          fetch("/api/trades", { cache: "no-store" }),
          fetch("/api/analytics/summary", { cache: "no-store" }),
        ]);

        if (!summaryRes.ok || !historyRes.ok || !tradesRes.ok || !analyticsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const [summaryData, historyData, tradesData, analyticsData] = (await Promise.all([
          summaryRes.json(),
          historyRes.json(),
          tradesRes.json(),
          analyticsRes.json(),
        ])) as [PortfolioSummary, PortfolioHistoryPoint[], TradeItem[], AnalyticsSummary];

        if (!isMounted) {
          return;
        }

        setSummary(summaryData);
        setHistory(historyData);
        setTrades(tradesData);
        setAnalytics(analyticsData);
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

      const mood = trade.mood || "Unknown";
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
        <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-5 text-[#9ca3af]">Loading trading terminal...</div>
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-5 text-[#ef4444]">{error || "Dashboard unavailable."}</div>
      </section>
    );
  }

  return (
    <section className="space-y-4 text-white">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">Balance</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            ₹{summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">Invested</p>
          <p className="mt-2 text-2xl font-semibold text-[#9ca3af]">
            ₹{summary.invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">P&amp;L</p>
          <p className={`mt-2 text-2xl font-semibold ${summary.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            ₹{summary.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`mt-1 text-sm ${summary.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{summary.pnlPercentage.toFixed(2)}%</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-[#9ca3af]">Win Rate</p>
            <p className="text-sm font-semibold text-white">{(analytics?.winRate ?? 0).toFixed(1)}%</p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#1f2937]">
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
            <p className="text-xs text-[#9ca3af]">Source: /api/portfolio/history</p>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value: number) => `₹${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1117",
                    border: "1px solid #1f2937",
                    color: "#ffffff",
                  }}
                  formatter={(value) => {
                    const rawValue = Array.isArray(value) ? value[0] : value;
                    const numericValue = Number(rawValue) || 0;
                    return [`₹${numericValue.toLocaleString()}`, "Value"];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${cardClass} xl:col-span-2`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Mood vs P&amp;L</h2>
            <p className="text-xs text-[#9ca3af]">Realized trades</p>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <BarChart data={moodVsPnlData}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
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
                <tr className="border-b border-[#1f2937] text-[#9ca3af]">
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
                  summary.holdings.map((holding) => {
                    const pnlPercent = holding.invested > 0 ? (holding.pnl / holding.invested) * 100 : 0;
                    return (
                      <tr key={holding.stock} className="border-b border-[#1f2937] transition hover:bg-[#0d1117]">
                        <td className="py-2 text-left text-white">{holding.stock}</td>
                        <td className="py-2 text-right text-[#d1d5db]">{holding.quantity}</td>
                        <td className="py-2 text-right text-[#d1d5db]">₹{holding.avgBuyPrice.toFixed(2)}</td>
                        <td className="py-2 text-right text-[#d1d5db]">₹{holding.currentPrice.toFixed(2)}</td>
                        <td className={`py-2 text-right font-semibold ${holding.pnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          ₹{holding.pnl.toFixed(2)}
                        </td>
                        <td className={`py-2 text-right font-semibold ${pnlPercent >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          {pnlPercent.toFixed(2)}%
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
                <div key={trade.id} className="rounded-lg border border-[#1f2937] bg-[#0d1117] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{trade.stock}</p>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        trade.type.toLowerCase() === "buy"
                          ? "bg-[#0f3d2e] text-[#22c55e]"
                          : "bg-[#3f1d1d] text-[#ef4444]"
                      }`}
                    >
                      {trade.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <p className="text-[#9ca3af]">
                      ₹{trade.price.toFixed(2)} x {trade.quantity}
                    </p>
                    <p className={`${(trade.pnl ?? 0) >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {trade.pnl === null ? "-" : `₹${trade.pnl.toFixed(2)}`}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-[#6b7280]">{timeAgo(trade.createdAt)}</p>
                </div>
              ))
            )}
          </div>

          <Link href="/history" className="mt-3 inline-block text-xs font-semibold text-[#3b82f6] hover:text-[#60a5fa]">
            View full history →
          </Link>
        </div>
      </div>
    </section>
  );
}
