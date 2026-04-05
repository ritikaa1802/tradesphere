"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProGate from "@/components/ProGate";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Gauge,
  Info,
  Newspaper,
  Target,
  TrendingUp,
  TriangleAlert,
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
  Pie,
  PieChart,
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

interface TriggeredAlertItem {
  id: string;
  symbol: string;
  targetPrice: number;
  currentPrice: number;
  condition: string;
}

interface SectorPoint {
  sector: string;
  value: number;
  percentage: number;
}

interface SectorResponse {
  sectors: SectorPoint[];
  diversification: {
    score: number;
    label: string;
    tip: string;
  };
}

type InsightSeverity = "warning" | "danger" | "success" | "info";

interface LossBreakdownItem {
  type: string;
  reason: string;
  amount: number;
  percent: number;
}

interface InsightItem {
  type: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  amount?: number;
  meta?: {
    mood?: string;
    percent?: number;
    bestMood?: string;
    bestPercent?: number;
    bestHour?: number;
    worstHour?: number;
    riskScore?: number;
    riskLabel?: string;
    reasons?: string[];
    breakdown?: LossBreakdownItem[];
    streakType?: "win" | "loss" | "none";
    streakCount?: number;
  };
}

const cardClass = "rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 shadow-[inset_0_1px_0_#1a2744] transition duration-200 hover:brightness-110";
const SECTOR_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

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

function getSeverityAccentColor(severity: InsightSeverity): string {
  if (severity === "danger") return "#ef4444";
  if (severity === "warning") return "#f59e0b";
  if (severity === "success") return "#22c55e";
  return "#3b82f6";
}

function InsightSeverityIcon({ severity }: { severity: InsightSeverity }) {
  if (severity === "danger") return <TriangleAlert size={18} className="text-[#ef4444]" />;
  if (severity === "warning") return <AlertTriangle size={18} className="text-[#f59e0b]" />;
  if (severity === "success") return <CheckCircle2 size={18} className="text-[#22c55e]" />;
  return <Info size={18} className="text-[#3b82f6]" />;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlertItem[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [sectorData, setSectorData] = useState<SectorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compactMode, setCompactMode] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(true);

  useEffect(() => {
    const onResize = () => {
      setCompactMode(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setInsightsOpen(true);
      }
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setError("");
        const [summaryRes, historyRes, tradesRes, analyticsRes, newsRes, alertsCheckRes, insightsRes, sectorsRes] = await Promise.all([
          fetch("/api/portfolio", { cache: "no-store" }),
          fetch("/api/portfolio/history", { cache: "no-store" }),
          fetch("/api/trades", { cache: "no-store" }),
          fetch("/api/analytics/summary", { cache: "no-store" }),
          fetch("/api/news", { cache: "no-store" }),
          fetch("/api/alerts/check", { cache: "no-store" }),
          fetch("/api/insights", { cache: "no-store" }),
          fetch("/api/portfolio/sectors", { cache: "no-store" }),
        ]);

        if (!summaryRes.ok || !historyRes.ok || !tradesRes.ok || !analyticsRes.ok || !newsRes.ok || !alertsCheckRes.ok || !insightsRes.ok || !sectorsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const [summaryData, historyData, tradesData, analyticsData, newsData, alertsData, insightsData, sectorsData] = (await Promise.all([
          summaryRes.json(),
          historyRes.json(),
          tradesRes.json(),
          analyticsRes.json(),
          newsRes.json(),
          alertsCheckRes.json(),
          insightsRes.json(),
          sectorsRes.json(),
        ])) as [PortfolioSummary, PortfolioHistoryPoint[], TradeItem[], AnalyticsSummary, NewsItem[], { triggeredAlerts: TriggeredAlertItem[] }, InsightItem[], SectorResponse];

        if (!isMounted) {
          return;
        }

        setSummary(summaryData);
        setHistory(historyData);
        setTrades(tradesData);
        setAnalytics(analyticsData);
        setNews(newsData);
        setTriggeredAlerts(alertsData.triggeredAlerts || []);
        setInsights(insightsData || []);
        setSectorData(sectorsData);
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

  const todayTradesCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return trades.filter((trade) => trade.createdAt.slice(0, 10) === today).length;
  }, [trades]);

  const revengeLossInsight = useMemo(() => {
    return insights.find((insight) => insight.type === "revenge-trading");
  }, [insights]);

  const moodWorstInsight = useMemo(() => {
    return insights.find((insight) => insight.type === "mood-worst");
  }, [insights]);

  const lossBreakdownInsight = useMemo(() => {
    return insights.find((insight) => insight.type === "loss-breakdown");
  }, [insights]);

  const riskScoreInsight = useMemo(() => {
    return insights.find((insight) => insight.type === "risk-score");
  }, [insights]);

  const todaysInsight = useMemo(() => {
    const score: Record<InsightSeverity, number> = {
      danger: 4,
      warning: 3,
      success: 2,
      info: 1,
    };

    const candidates = insights.filter((insight) => insight.type !== "loss-breakdown" && insight.type !== "risk-score" && insight.type !== "streak");
    if (candidates.length === 0) {
      return null;
    }

    return [...candidates].sort((a, b) => score[b.severity] - score[a.severity])[0];
  }, [insights]);

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
      {triggeredAlerts.length > 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-200">Price Alert Triggered</p>
          <div className="mt-2 space-y-1">
            {triggeredAlerts.slice(0, 3).map((alert) => (
              <p key={alert.id} className="text-sm text-amber-100">
                {alert.symbol}: {alert.condition === "above" ? "above" : "below"} ₹{alert.targetPrice.toFixed(2)} (now ₹{alert.currentPrice.toFixed(2)})
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          {Number(revengeLossInsight?.amount || 0) > 0 ? (
            <p className="mt-1 text-xs font-semibold text-[#ef4444]">₹{Number(revengeLossInsight?.amount || 0).toFixed(2)} from revenge trading</p>
          ) : null}
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

      <div className="grid grid-cols-1 gap-3">
        <div className={`${cardClass}`}>
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

      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className={`${cardClass} xl:col-span-3`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Portfolio Value Over Time</h2>
            <p className="text-xs text-[#9ca3af]">Net curve</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer>
              <AreaChart data={history} margin={{ top: 8, right: compactMode ? 4 : 12, left: compactMode ? -14 : 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a2744" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: compactMode ? 9 : 11 }} interval={compactMode ? "preserveStartEnd" : 0} minTickGap={compactMode ? 28 : 8} />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: compactMode ? 9 : 11 }}
                  domain={["auto", "auto"]}
                  width={compactMode ? 38 : 52}
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

        <div className={`${cardClass} lg:col-span-2`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Mood vs P&amp;L</h2>
            <p className="text-xs text-[#9ca3af]">Behavior impact</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={moodVsPnlData} margin={{ top: 8, right: compactMode ? 4 : 12, left: compactMode ? -18 : 0, bottom: 0 }}>
                <CartesianGrid stroke="#1a2744" strokeDasharray="3 3" />
                <XAxis dataKey="mood" stroke="#9ca3af" tick={{ fontSize: compactMode ? 9 : 11 }} interval={0} minTickGap={compactMode ? 14 : 8} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: compactMode ? 9 : 11 }} width={compactMode ? 32 : 42} />
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
          <p className={`mt-2 text-xs ${Number(moodWorstInsight?.meta?.percent || 0) > 0 ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
            Your profit drops {(moodWorstInsight?.meta?.percent || 0).toFixed(1)}% when mood = {moodWorstInsight?.meta?.mood || "Neutral"}
          </p>
        </div>
      </div>

      <ProGate>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setInsightsOpen((value) => !value)}
          className="w-full rounded-xl border border-[#1a2744] bg-[#0d1421] px-4 py-2 text-left text-sm font-semibold text-white md:hidden"
        >
          {insightsOpen ? "Hide Insights" : "Show Insights"}
        </button>

        {insightsOpen ? (
          <>
        <div
          className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4"
          style={{ borderLeft: `3px solid ${getSeverityAccentColor(todaysInsight?.severity || "info")}` }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <InsightSeverityIcon severity={todaysInsight?.severity || "info"} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Today&apos;s Insight</p>
              {todayTradesCount === 0 ? (
                <p className="mt-1 text-sm text-[#9ca3af]">No trades today - start trading to get insights</p>
              ) : todaysInsight ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-white">{todaysInsight.title}</p>
                  <p className="mt-1 text-sm text-[#9ca3af]">{todaysInsight.description}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-[#9ca3af]">Keep trading consistently to unlock behavior patterns.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <div className={`${cardClass}`}>
            <h3 className="text-sm font-semibold text-white">Why You&apos;re Losing Money</h3>
            <div className="mt-3 space-y-3">
              {(lossBreakdownInsight?.meta?.breakdown || []).slice(0, 3).map((item) => (
                <div key={item.type}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[#d1d5db]">{item.reason}</span>
                    <span className="font-semibold text-[#ef4444]">₹{item.amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#1a2744]">
                    <div className="h-full rounded-full bg-[#ef4444]" style={{ width: `${Math.max(3, Math.min(100, item.percent))}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-[#9ca3af]">{item.percent.toFixed(1)}%</p>
                </div>
              ))}
              {(lossBreakdownInsight?.meta?.breakdown || []).length === 0 ? (
                <p className="text-sm text-[#9ca3af]">Not enough losing-trade data to break down losses yet.</p>
              ) : null}
            </div>
          </div>

          <div className={`${cardClass}`}>
            <h3 className="text-sm font-semibold text-white">Risk Score</h3>
            <div className="mt-3 flex flex-col items-center justify-center">
              <p
                className={`text-6xl font-bold ${
                  Number(riskScoreInsight?.meta?.riskScore || 0) <= 3
                    ? "text-[#22c55e]"
                    : Number(riskScoreInsight?.meta?.riskScore || 0) <= 6
                      ? "text-[#f59e0b]"
                      : "text-[#ef4444]"
                }`}
              >
                {Number(riskScoreInsight?.meta?.riskScore || 0)}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#d1d5db]">{riskScoreInsight?.meta?.riskLabel || "Moderate Risk Trader"}</p>
            </div>
            <ul className="mt-4 space-y-1 text-xs text-[#9ca3af]">
              {(riskScoreInsight?.meta?.reasons || []).slice(0, 3).map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          </div>
        </div>

          </>
        ) : null}
      </div>
      </ProGate>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className={`${cardClass} lg:col-span-3`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Holdings</h2>
            <p className="text-xs text-[#9ca3af]">
              Last updated: {new Date(summary.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="max-h-[260px] overflow-auto">
            <table className="min-w-[640px] text-xs">
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

        <div className="space-y-3 lg:col-span-2">
          <div className={`${cardClass}`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Sector Allocation</h2>
              <p className="text-xs text-[#9ca3af]">Portfolio mix</p>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0d1117", border: "1px solid #1a2744", color: "#fff" }}
                    formatter={(value, name, props) => [`₹${Number(value).toFixed(2)}`, `${String(name)} (${(props.payload as SectorPoint).percentage.toFixed(1)}%)`]}
                  />
                  <Pie data={sectorData?.sectors || []} dataKey="value" nameKey="sector" outerRadius={compactMode ? 64 : 80} label={!compactMode}>
                    {(sectorData?.sectors || []).map((entry, index) => (
                      <Cell key={entry.sector} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 rounded-lg border border-[#1a2744] bg-[#0a0f1a] p-3">
              <p className="text-sm font-semibold text-white">Diversification Score: {sectorData?.diversification?.score ?? 1}/10</p>
              <p className="mt-1 text-xs text-[#9ca3af]">{sectorData?.diversification?.label || "Highly Concentrated ⚠️"}</p>
              <p className="mt-1 text-xs text-[#9ca3af]">{sectorData?.diversification?.tip || "Add more sectors to reduce concentration risk."}</p>
            </div>
          </div>

          <div className={`${cardClass}`}>
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
