"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, Trophy } from "lucide-react";

interface Contest {
  id: string;
  title: string;
  description: string;
  prizeDescription: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: "live" | "upcoming" | "ended";
  participants: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  gainPercent: number;
  totalTrades: number;
  isPro: boolean;
}

interface ContestPayload {
  contest: Contest;
  leaderboard: LeaderboardEntry[];
  isJoined: boolean;
  yourRank: number | null;
}

function getCountdown(endDate: string) {
  const total = Math.max(0, new Date(endDate).getTime() - Date.now());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  return { days, hours, minutes };
}

export default function ContestRoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");
  const [payload, setPayload] = useState<ContestPayload | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const response = await fetch(`/api/competitions/${params.id}`, { cache: "no-store" });
      const data = (await response.json()) as ContestPayload & { error?: string };
      if (!mounted) return;

      if (!response.ok) {
        setMessage(data?.error || "Contest not found");
        setLoading(false);
        return;
      }

      setPayload(data);
      setLoading(false);
    }

    load();
    const id = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [params.id]);

  async function joinContest() {
    setJoining(true);
    setMessage("");
    const response = await fetch("/api/competitions/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competitionId: params.id }),
    });
    const data = (await response.json()) as { message?: string; error?: string };
    setMessage(data?.message || data?.error || "Updated");

    if (response.ok) {
      const reload = await fetch(`/api/competitions/${params.id}`, { cache: "no-store" });
      const latest = (await reload.json()) as ContestPayload;
      setPayload(latest);
    }

    setJoining(false);
  }

  const countdown = useMemo(() => {
    if (!payload?.contest?.endDate) return { days: 0, hours: 0, minutes: 0 };
    return getCountdown(payload.contest.endDate);
  }, [payload?.contest?.endDate]);

  if (loading) {
    return <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-[var(--text-secondary)]">Loading contest room...</section>;
  }

  if (!payload) {
    return <section className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-rose-300">{message || "Contest not found"}</section>;
  }

  const { contest, leaderboard, isJoined, yourRank } = payload;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/competitions")}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)]"
        >
          <ArrowLeft size={16} /> Back to contests
        </button>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          {contest.status.toUpperCase()} CONTEST ROOM
        </span>
      </div>

      <div className="rounded-2xl border border-[#254171] bg-[#12264a] p-5">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h1 className="text-3xl font-black text-white">{contest.title}</h1>
            <p className="mt-2 text-sm text-slate-300">{contest.description}</p>
            <p className="mt-3 text-xl font-extrabold text-amber-300">{contest.prizeDescription}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-300">{contest.participants.toLocaleString("en-IN")} participants</span>
              <span>Paper capital: Rs.100,000</span>
              <span>Ranking basis: paper portfolio gain %</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#315896] bg-[#0f1f3e] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300"><Clock3 size={16} /> Time remaining</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-[#315896] bg-[#0d1f42] p-2"><p className="text-xl font-black text-white">{countdown.days}</p><p className="text-[10px] text-slate-400">Days</p></div>
              <div className="rounded-lg border border-[#315896] bg-[#0d1f42] p-2"><p className="text-xl font-black text-white">{countdown.hours}</p><p className="text-[10px] text-slate-400">Hours</p></div>
              <div className="rounded-lg border border-[#315896] bg-[#0d1f42] p-2"><p className="text-xl font-black text-white">{countdown.minutes}</p><p className="text-[10px] text-slate-400">Mins</p></div>
            </div>

            {!isJoined ? (
              <button
                type="button"
                onClick={joinContest}
                disabled={joining}
                className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {joining ? "Joining..." : "Join contest"}
              </button>
            ) : (
              <Link
                href={`/trade?contestId=${contest.id}&contestTitle=${encodeURIComponent(contest.title)}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-500"
              >
                Start paper trading <ArrowRight size={16} />
              </Link>
            )}

            {message ? <p className="mt-2 text-xs text-slate-300">{message}</p> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Contest leaderboard</h2>
            <span className="text-xs text-[var(--text-secondary)]">Updates every 30 seconds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Trader</th>
                  <th className="py-2 text-right">Gain %</th>
                  <th className="py-2 text-right">Trades</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.userId} className={`border-b border-[var(--border)] ${entry.rank === yourRank ? "bg-blue-500/10" : ""}`}>
                    <td className="py-2 text-[var(--text-primary)]">#{entry.rank}</td>
                    <td className="py-2 text-[var(--text-primary)]">
                      {entry.displayName}
                      {entry.isPro ? <span className="ml-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">PRO</span> : null}
                    </td>
                    <td className={`py-2 text-right font-semibold ${entry.gainPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{entry.gainPercent.toFixed(2)}%</td>
                    <td className="py-2 text-right text-[var(--text-secondary)]">{entry.totalTrades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h3 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">How to play</h3>
          <ol className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>1. Join this contest room.</li>
            <li>2. Click Start paper trading.</li>
            <li>3. Place paper buy/sell orders on Trade page.</li>
            <li>4. Improve gain %, consistency, and rank.</li>
          </ol>

          <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-200">
            <div className="mb-1 flex items-center gap-2 font-semibold"><Trophy size={14} /> Note</div>
            Current ranking uses paper portfolio performance and is not tied to real-money PnL.
          </div>
        </aside>
      </div>
    </section>
  );
}
