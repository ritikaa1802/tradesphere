"use client";

import { useEffect, useMemo, useState } from "react";

interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  prizeDescription: string;
  isActive: boolean;
  _count?: { entries: number };
}

interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string;
  gainPercent: number;
  totalTrades: number;
  isPro: boolean;
}

interface LeaderboardResponse {
  entries: LeaderboardRow[];
  yourRank: number | null;
  competition?: Competition;
}

function getCountdown(endDate: string) {
  const total = Math.max(0, new Date(endDate).getTime() - Date.now());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse>({ entries: [], yourRank: null });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [competitionsRes, leaderboardRes] = await Promise.all([
        fetch("/api/competitions", { cache: "no-store" }),
        fetch("/api/competitions/leaderboard", { cache: "no-store" }),
      ]);

      if (!mounted) {
        return;
      }

      if (competitionsRes.ok) {
        const comps = (await competitionsRes.json()) as Competition[];
        setCompetitions(comps);
      }

      if (leaderboardRes.ok) {
        const data = (await leaderboardRes.json()) as LeaderboardResponse;
        setLeaderboard(data);
      }

      setLoading(false);
    }

    load();
    const id = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const activeCompetition = useMemo(() => {
    return competitions.find((competition) => competition.isActive) || leaderboard.competition;
  }, [competitions, leaderboard.competition]);

  useEffect(() => {
    if (!activeCompetition?.endDate) {
      return;
    }

    setCountdown(getCountdown(activeCompetition.endDate));
    const timer = setInterval(() => {
      setCountdown(getCountdown(activeCompetition.endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCompetition?.endDate]);

  async function joinCompetition() {
    setJoining(true);
    setMessage("");

    const res = await fetch("/api/competitions/join", { method: "POST" });
    const data = await res.json();
    setMessage(data?.message || data?.error || "Updated");
    setJoining(false);
  }

  if (loading) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#9ca3af]">Loading competitions...</section>;
  }

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 sm:p-5">
        <h1 className="text-2xl font-bold text-white">{activeCompetition?.title || "Trading Competitions"}</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">{activeCompetition?.description || "Join competitions and climb the leaderboard."}</p>
        <p className="mt-2 text-sm font-semibold text-amber-300">Prize: {activeCompetition?.prizeDescription || "TBA"}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded bg-[#0f1929] p-2"><p className="text-xl font-bold text-white">{countdown.days}</p><p className="text-xs text-[#9ca3af]">Days</p></div>
          <div className="rounded bg-[#0f1929] p-2"><p className="text-xl font-bold text-white">{countdown.hours}</p><p className="text-xs text-[#9ca3af]">Hours</p></div>
          <div className="rounded bg-[#0f1929] p-2"><p className="text-xl font-bold text-white">{countdown.minutes}</p><p className="text-xs text-[#9ca3af]">Minutes</p></div>
          <div className="rounded bg-[#0f1929] p-2"><p className="text-xl font-bold text-white">{countdown.seconds}</p><p className="text-xs text-[#9ca3af]">Seconds</p></div>
        </div>
        <button
          type="button"
          onClick={joinCompetition}
          disabled={joining}
          className="mt-4 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
        >
          {joining ? "Joining..." : "Join Competition"}
        </button>
        {message ? <p className="mt-2 text-sm text-[#9ca3af]">{message}</p> : null}
      </div>

      <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-3 sm:p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Live Leaderboard</h2>
        <div className="overflow-x-auto">
        <table className="min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[#1a2744] text-left text-[#9ca3af]">
              <th className="py-2">Rank</th>
              <th className="py-2">Name</th>
              <th className="py-2 text-right">Gain %</th>
              <th className="hidden py-2 text-right sm:table-cell">Trades</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.entries.map((entry) => (
              <tr
                key={entry.userId}
                className={`border-b border-[#1a2744] ${leaderboard.yourRank === entry.rank ? "bg-blue-500/10" : ""}`}
              >
                <td className="py-2 text-white">#{entry.rank}</td>
                <td className="py-2 text-white">
                  {entry.displayName} {entry.isPro ? <span className="ml-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">PRO</span> : null}
                </td>
                <td className={`py-2 text-right font-semibold ${entry.gainPercent >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  {entry.gainPercent.toFixed(2)}%
                </td>
                <td className="hidden py-2 text-right text-[#d1d5db] sm:table-cell">{entry.totalTrades}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4">
        <h3 className="text-sm font-semibold text-white">How it works</h3>
        <ul className="mt-2 space-y-1 text-sm text-[#9ca3af]">
          <li>• Join the active competition from this page.</li>
          <li>• Rank is based on gain percentage from your paper portfolio.</li>
          <li>• Trade smartly: frequent overtrading can hurt consistency.</li>
        </ul>
      </div>
    </section>
  );
}
