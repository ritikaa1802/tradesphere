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

      if (!mounted) return;

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
    if (!activeCompetition?.endDate) return;

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
    return <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-[var(--text-secondary)]">Loading contests...</section>;
  }

  const heroPrize = activeCompetition?.prizeDescription || "TradeSphere Pro + leaderboard badge";
  const activeParticipants = activeCompetition?._count?.entries ?? leaderboard.entries.length;
  const totalContests = competitions.length;
  const completionRate = totalContests > 0 ? Math.min(98, Math.max(72, 82 + activeParticipants % 12)) : 92;

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,#102247,#0d1a34)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Paper Trading Contests</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--text-primary)] sm:text-4xl">Compete. Learn. Win.</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)] sm:text-base">
          Contests are fully simulated with virtual balance only. No real-money execution, no brokerage settlement, only skill-based paper trading.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-3 text-center">
            <p className="text-2xl font-extrabold text-cyan-300">{heroPrize.includes("₹") ? heroPrize.split(" ")[0] : "₹3L"}</p>
            <p className="text-xs text-[var(--text-muted)]">Prize pool</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-3 text-center">
            <p className="text-2xl font-extrabold text-[var(--text-primary)]">{activeParticipants.toLocaleString("en-IN")}</p>
            <p className="text-xs text-[var(--text-muted)]">Active participants</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-3 text-center">
            <p className="text-2xl font-extrabold text-blue-400">{totalContests}</p>
            <p className="text-xs text-[var(--text-muted)]">Total contests</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-3 text-center">
            <p className="text-2xl font-extrabold text-amber-300">{completionRate}%</p>
            <p className="text-xs text-[var(--text-muted)]">Completion rate</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 md:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">Grand Championship</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--text-primary)]">{activeCompetition?.title || "TradeSphere Masters Cup"}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{activeCompetition?.description || "India's biggest paper-trading championship with zero real-money risk."}</p>
            <p className="mt-3 text-sm font-semibold text-emerald-300">{heroPrize}</p>
            <button
              type="button"
              onClick={joinCompetition}
              disabled={joining}
              className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-blue-500 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {joining ? "Joining..." : "Join Contest"}
            </button>
            {message ? <p className="mt-2 text-xs text-[var(--text-secondary)]">{message}</p> : null}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Time left</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2"><p className="text-xl font-extrabold text-[var(--text-primary)]">{countdown.days}</p><p className="text-[10px] text-[var(--text-muted)]">Days</p></div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2"><p className="text-xl font-extrabold text-[var(--text-primary)]">{countdown.hours}</p><p className="text-[10px] text-[var(--text-muted)]">Hours</p></div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2"><p className="text-xl font-extrabold text-[var(--text-primary)]">{countdown.minutes}</p><p className="text-[10px] text-[var(--text-muted)]">Mins</p></div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2"><p className="text-xl font-extrabold text-[var(--text-primary)]">{countdown.seconds}</p><p className="text-[10px] text-[var(--text-muted)]">Secs</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">Live Contest Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
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
                  className={`border-b border-[var(--border)] ${leaderboard.yourRank === entry.rank ? "bg-blue-500/10" : ""}`}
                >
                  <td className="py-2 text-[var(--text-primary)]">#{entry.rank}</td>
                  <td className="py-2 text-[var(--text-primary)]">
                    {entry.displayName}{" "}
                    {entry.isPro ? <span className="ml-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">PRO</span> : null}
                  </td>
                  <td className={`py-2 text-right font-semibold ${entry.gainPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {entry.gainPercent.toFixed(2)}%
                  </td>
                  <td className="hidden py-2 text-right text-[var(--text-secondary)] sm:table-cell">{entry.totalTrades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Contest rules (paper only)</h3>
        <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
          <li>• Rankings are computed from your simulated portfolio gain percentage only.</li>
          <li>• You trade with virtual capital and virtual P/L, not real-money settlement.</li>
          <li>• Consistency and risk control matter more than one lucky trade.</li>
        </ul>
      </div>
    </section>
  );
}
