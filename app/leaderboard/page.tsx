"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { SkeletonCard, SkeletonTable } from "@/components/Skeleton";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  gainPercent: number;
  totalTrades: number;
  isPro: boolean;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  yourRank: number | null;
  weeklyResetInDays: number;
}

function rankStyle(rank: number): string {
  if (rank === 1) return "border-[#f59e0b] bg-[#2a1c05]";
  if (rank === 2) return "border-[#94a3b8] bg-[#1b2230]";
  if (rank === 3) return "border-[#b45309] bg-[#2a1b12]";
  return "border-[#1a2744] bg-[#0d1421]";
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadLeaderboard() {
      try {
        setError("");
        const response = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load leaderboard");
        }

        const json = (await response.json()) as LeaderboardResponse;
        if (mounted) {
          setData(json);
        }
      } catch {
        if (mounted) {
          setError("Could not load leaderboard");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadLeaderboard();
    return () => {
      mounted = false;
    };
  }, []);

  const topThree = useMemo(() => data?.entries.slice(0, 3) ?? [], [data]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={`leader-top-${index}`} className="h-36" />
          ))}
        </div>
        <SkeletonTable rows={5} />
      </section>
    );
  }

  if (error) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#ef4444]">{error}</section>;
  }

  if (!data || data.entries.length === 0) {
    return (
      <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f1929] text-[#3b82f6]">
            <Trophy size={20} />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-white">Be the first on the leaderboard!</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">Enable leaderboard in settings.</p>
          <Link href="/settings" className="mt-3 text-sm font-semibold text-[#3b82f6] hover:text-[#60a5fa]">
            Open Settings →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1a2744] bg-[#0d1421] p-4">
        <h2 className="text-lg font-semibold text-white">Global Leaderboard</h2>
        <span className="rounded-md border border-[#1a2744] bg-[#0f1929] px-3 py-1 text-xs font-semibold text-[#3b82f6]">
          Weekly reset in {data.weeklyResetInDays} day{data.weeklyResetInDays === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {topThree.map((entry) => (
          <div key={entry.rank} className={`rounded-xl border p-4 ${rankStyle(entry.rank)}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Rank #{entry.rank}</p>
            <p className="mt-2 text-lg font-bold text-white">{entry.displayName}</p>
            {entry.isPro ? <span className="mt-2 inline-block rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-black">PRO</span> : null}
            <p className={`mt-2 text-xl font-bold ${entry.gainPercent >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              {entry.gainPercent.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-[#9ca3af]">{entry.totalTrades} trades</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2744] text-left text-[#9ca3af]">
              <th className="py-2">Rank</th>
              <th className="py-2">Name</th>
              <th className="py-2 text-right">Gain %</th>
              <th className="py-2 text-right">Trades</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry) => (
              <tr
                key={`${entry.rank}-${entry.displayName}`}
                className={`border-b border-[#1a2744] ${data.yourRank === entry.rank ? "bg-[#0f1929]" : "bg-transparent"}`}
              >
                <td className="py-2 text-white">#{entry.rank}</td>
                <td className="py-2 font-semibold text-white">
                  {entry.displayName} {entry.isPro ? <span className="ml-1 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-black">PRO</span> : null}
                </td>
                <td className={`py-2 text-right font-semibold ${entry.gainPercent >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  {entry.gainPercent.toFixed(2)}%
                </td>
                <td className="py-2 text-right text-[#d1d5db]">{entry.totalTrades}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
