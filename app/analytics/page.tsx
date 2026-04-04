import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/analytics";

function formatValue(value: number, isPercent = false) {
  if (isPercent) {
    return `${value.toFixed(2)}%`;
  }
  return value.toFixed(2);
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
        <p className="text-rose-400">Unauthorized. Go to <Link href="/login">login</Link>.</p>
      </main>
    );
  }

  const summary = await getAnalyticsSummary(session.user.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">Analytics</h1>
          <p className="mt-2 text-slate-400">Professional trading insights based on your completed trades.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Win Rate</p>
            <p className="mt-2 text-3xl font-semibold">{formatValue(summary.winRate, true)}</p>
            <p className="text-slate-400">{summary.totalTrades} completed trades</p>
          </div>

          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Average Profit on Winning Trades</p>
            <p className="mt-2 text-3xl font-semibold">₹{formatValue(summary.averageProfit)}</p>
          </div>

          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Average Loss on Losing Trades</p>
            <p className="mt-2 text-3xl font-semibold">₹{formatValue(summary.averageLoss)}</p>
          </div>

          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Risk / Reward Ratio</p>
            <p className="mt-2 text-3xl font-semibold">{summary.riskRewardRatio > 0 ? summary.riskRewardRatio.toFixed(2) : "N/A"}</p>
          </div>

          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Current Win Streak</p>
            <p className="mt-2 text-3xl font-semibold">{summary.currentWinStreak}</p>
          </div>

          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Current Loss Streak</p>
            <p className="mt-2 text-3xl font-semibold">{summary.currentLossStreak}</p>
          </div>

          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Best Performing Stock</p>
            <p className="mt-2 text-xl font-semibold">{summary.bestPerformingStock?.stock ?? "N/A"}</p>
            {summary.bestPerformingStock ? (
              <p className="text-slate-400">₹{formatValue(summary.bestPerformingStock.totalPnl)}</p>
            ) : null}
          </div>

          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Most Traded Stock</p>
            <p className="mt-2 text-xl font-semibold">{summary.mostTradedStock?.stock ?? "N/A"}</p>
            {summary.mostTradedStock ? (
              <p className="text-slate-400">{summary.mostTradedStock.count} trades</p>
            ) : null}
          </div>

          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Best Trading Day</p>
            <p className="mt-2 text-xl font-semibold">{summary.bestTradingDay?.date ?? "N/A"}</p>
            {summary.bestTradingDay ? (
              <p className="text-slate-400">₹{formatValue(summary.bestTradingDay.totalPnl)}</p>
            ) : null}
          </div>

          <div className="rounded bg-slate-800 p-5">
            <p className="text-sm text-slate-500">Worst Trading Day</p>
            <p className="mt-2 text-xl font-semibold">{summary.worstTradingDay?.date ?? "N/A"}</p>
            {summary.worstTradingDay ? (
              <p className="text-slate-400">₹{formatValue(summary.worstTradingDay.totalPnl)}</p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
