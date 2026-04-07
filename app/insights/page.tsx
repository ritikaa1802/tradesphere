"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type InsightSeverity = "warning" | "danger" | "success" | "info";

type LossBreakdownItem = {
  type: string;
  reason: string;
  amount: number;
  percent: number;
};

type InsightItem = {
  type: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  amount?: number;
  meta?: {
    riskScore?: number;
    riskLabel?: string;
    reasons?: string[];
    breakdown?: LossBreakdownItem[];
    streakType?: "win" | "loss" | "none";
    streakCount?: number;
  };
};

interface AnalyticsSummary {
  winRate: number;
  currentWinStreak?: number;
  currentLossStreak?: number;
  riskRewardRatio?: number;
}

interface PortfolioSummary {
  pnl: number;
}

interface LeaderboardSummary {
  yourRank: number | null;
  entries: Array<{ rank: number }>;
}

function severityChip(severity: InsightSeverity): string {
  if (severity === "danger") return "bg-rose-900/50 text-rose-300";
  if (severity === "warning") return "bg-amber-900/50 text-amber-300";
  if (severity === "success") return "bg-emerald-900/50 text-emerald-300";
  return "bg-blue-900/50 text-blue-300";
}

function formatMoney(value: number): string {
  return `₹${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function changeColor(value: number): string {
  return value >= 0 ? "text-emerald-400" : "text-rose-400";
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadInsights() {
      try {
        setError("");
        const [insightsRes, analyticsRes, portfolioRes, leaderboardRes] = await Promise.all([
          fetch("/api/insights", { cache: "no-store" }),
          fetch("/api/analytics/summary", { cache: "no-store" }),
          fetch("/api/portfolio", { cache: "no-store" }),
          fetch("/api/leaderboard", { cache: "no-store" }),
        ]);

        if (!insightsRes.ok || !analyticsRes.ok || !portfolioRes.ok) {
          throw new Error("Failed to load insights");
        }

        const [insightsData, analyticsData, portfolioData] = await Promise.all([
          insightsRes.json() as Promise<InsightItem[]>,
          analyticsRes.json() as Promise<AnalyticsSummary>,
          portfolioRes.json() as Promise<PortfolioSummary>,
        ]);

        const leaderboardData = leaderboardRes.ok
          ? (await leaderboardRes.json()) as LeaderboardSummary
          : null;

        if (!mounted) return;
        setInsights(insightsData || []);
        setAnalytics(analyticsData);
        setPortfolio(portfolioData);
        setLeaderboard(leaderboardData);
      } catch {
        if (mounted) {
          setError("Unable to load insights right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInsights();
    const id = setInterval(loadInsights, 15000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const riskInsight = useMemo(() => insights.find((item) => item.type === "risk-score"), [insights]);
  const lossBreakdownInsight = useMemo(() => insights.find((item) => item.type === "loss-breakdown"), [insights]);
  const streakInsight = useMemo(() => insights.find((item) => item.type === "streak"), [insights]);

  const readinessWeeks = useMemo(() => {
    return Math.min(3, Math.max(0, analytics?.currentWinStreak || 0));
  }, [analytics?.currentWinStreak]);

  const readinessLabel = useMemo(() => {
    if ((analytics?.winRate || 0) >= 65 && (analytics?.riskRewardRatio || 0) >= 1.5) {
      return "Close to live-ready";
    }
    if ((analytics?.winRate || 0) >= 50) {
      return "Needs more consistency";
    }
    return "Not ready to go live yet";
  }, [analytics?.riskRewardRatio, analytics?.winRate]);

  const slippageAdjustedPnl = useMemo(() => {
    const gross = portfolio?.pnl || 0;
    if (gross <= 0) return gross;
    return gross * 0.91;
  }, [portfolio?.pnl]);

  const topLossReason = lossBreakdownInsight?.meta?.breakdown?.[0];

  if (loading) {
    return <section className="text-sm text-slate-400">Loading insights dashboard...</section>;
  }

  if (error) {
    return <section className="text-sm text-rose-400">{error}</section>;
  }

  return (
    <section className="space-y-3 text-white">
      <div className="border-b border-[#1a2744] pb-2">
        <h1 className="text-base font-semibold">Insights Dashboard</h1>
        <p className="mt-1 text-xs text-slate-400">Benchmark-style trade quality and readiness analysis.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Risk Score</p>
          <p className="mt-1 text-3xl font-semibold text-amber-300">{riskInsight?.meta?.riskScore ?? 5}/10</p>
          <p className="text-xs text-[#9ca3af]">{riskInsight?.meta?.riskLabel || "Moderate"}</p>
        </div>
        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Loss Streak</p>
          <p className="mt-1 text-3xl font-semibold text-white">{analytics?.currentLossStreak || 0}</p>
          <p className="text-xs text-[#9ca3af]">trade</p>
        </div>
        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Paper P&amp;L</p>
          <p className={`mt-1 text-3xl font-semibold ${changeColor(portfolio?.pnl || 0)}`}>{(portfolio?.pnl || 0) >= 0 ? "+" : "-"}{formatMoney(portfolio?.pnl || 0)}</p>
          <p className="text-xs text-[#9ca3af]">This week</p>
        </div>
        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Win Rate</p>
          <p className="mt-1 text-3xl font-semibold text-white">{(analytics?.winRate || 0).toFixed(0)}%</p>
          <p className="text-xs text-[#9ca3af]">Paper trades</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">Loss breakdown</p>
              <p className="text-sm text-[#cbd5e1]">
                {topLossReason
                  ? `₹${topLossReason.amount.toFixed(0)} lost to ${topLossReason.reason.toLowerCase()} - ${topLossReason.percent.toFixed(0)}% of total losses`
                  : "No impulsive loss pattern detected yet."}
              </p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityChip(lossBreakdownInsight?.severity || "info")}`}>
                {(lossBreakdownInsight?.severity || "info").toUpperCase()}
              </span>
              <p className="mt-2 text-3xl font-semibold text-[#93c5fd]">{topLossReason?.percent?.toFixed(0) || 0}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">Risk score - {riskInsight?.meta?.riskLabel || "Moderate"}</p>
              <p className="text-sm text-[#cbd5e1]">{riskInsight?.meta?.reasons?.[0] || "Position sizing is manageable. Keep stop-loss discipline."}</p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityChip(riskInsight?.severity || "warning")}`}>
                {(riskInsight?.severity || "warning").toUpperCase()}
              </span>
              <p className="mt-2 text-3xl font-semibold text-amber-300">{riskInsight?.meta?.riskScore || 5}/10</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">{(streakInsight?.meta?.streakType || "none") === "win" ? "Win streak" : "Loss streak"} - {streakInsight?.meta?.streakCount || 0} trade</p>
              <p className="text-sm text-[#cbd5e1]">
                {(streakInsight?.meta?.streakType || "none") === "win"
                  ? "Good momentum. Keep risk per trade consistent."
                  : "Low risk now, but reduce size if streak extends beyond 3 trades."}
              </p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityChip(streakInsight?.severity || "warning")}`}>
                {(streakInsight?.severity || "warning").toUpperCase()}
              </span>
              <p className="mt-2 text-3xl font-semibold text-amber-300">{streakInsight?.meta?.streakCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4">
        <h4 className="text-lg font-semibold text-white">Paper trading</h4>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-[#0a0f1a] p-3">
            <p className="text-sm text-[#9ca3af]">Total P&amp;L</p>
            <p className={`text-3xl font-semibold ${changeColor(portfolio?.pnl || 0)}`}>{(portfolio?.pnl || 0) >= 0 ? "+" : "-"}{formatMoney(portfolio?.pnl || 0)}</p>
          </div>
          <div className="rounded-lg bg-[#0a0f1a] p-3">
            <p className="text-sm text-[#9ca3af]">Win rate</p>
            <p className="text-3xl font-semibold text-white">{(analytics?.winRate || 0).toFixed(0)}%</p>
          </div>
          <div className="rounded-lg bg-[#0a0f1a] p-3">
            <p className="text-sm text-[#9ca3af]">Avg R:R</p>
            <p className="text-3xl font-semibold text-white">{(analytics?.riskRewardRatio || 0).toFixed(1)}x</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-b border-[#1a2744] pb-2">
        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">Readiness score - {readinessLabel}</p>
              <p className="text-sm text-[#cbd5e1]">You need 3+ consecutive profitable weeks and stable sizing before going live.</p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">{readinessWeeks}/3 weeks</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">Slippage simulation</p>
              <p className="text-sm text-[#cbd5e1]">Paper P&amp;L adjusted for live slippage (0.05% per trade) estimates execution impact.</p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Simulated</span>
              <p className={`mt-2 text-3xl font-semibold ${changeColor(slippageAdjustedPnl)}`}>{slippageAdjustedPnl >= 0 ? "+" : "-"}{formatMoney(slippageAdjustedPnl)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">Leaderboard rank</p>
              <p className="text-sm text-[#cbd5e1]">
                {leaderboard?.yourRank
                  ? `You rank #${leaderboard.yourRank} of ${leaderboard.entries.length || 0} active traders this week.`
                  : "Join leaderboard from settings to benchmark against top performers."}
              </p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Top tier</span>
              <p className="mt-2 text-3xl font-semibold text-[#93c5fd]">#{leaderboard?.yourRank || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Link href="/dashboard" className="text-xs font-semibold text-[#60a5fa] hover:text-[#93c5fd]">
          ← Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
