"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import ChallengeGuideBooklet from "@/components/ChallengeGuideBooklet";

type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxParticipants: number;
  isPro: boolean;
  participantCount: number;
  myEntry: {
    id: string;
    rank: number;
    disciplineScore: number;
    totalTrades: number;
    ruleBreaks: number;
    checklistCompletion: number;
  } | null;
  top10: Array<{
    id: string;
    userId: string;
    rank: number;
    displayName: string;
    disciplineScore: number;
    totalTrades: number;
    ruleBreaks: number;
    checklistCompletion: number;
    isPro: boolean;
  }>;
};

type Champion = {
  id: string;
  month: string;
  year: string;
  disciplineScore: number;
  displayName: string;
  badge: string;
  createdAt: string;
};

type ChallengesPayload = {
  challenges: Challenge[];
  monthlyChampion: Champion | null;
  pastChampions: Array<{
    id: string;
    month: string;
    year: string;
    disciplineScore: number;
    displayName: string;
    badge: string;
  }>;
  myBadges: {
    sevenDayChampion: boolean;
    thirtyDayChampion: boolean;
    monthlyChampion: boolean;
  };
  monthlyCountdown: string;
};

type LeaderboardPayload = {
  challenge: { id: string; title: string; isPro: boolean };
  entries: Array<{
    id: string;
    rank: number;
    userId: string;
    displayName: string;
    disciplineScore: number;
    totalTrades: number;
    ruleBreaks: number;
    checklistCompletion: number;
    isPro: boolean;
    isCurrentUser: boolean;
    isMonthlyChampion: boolean;
  }>;
  yourRank: number | null;
};

function daysRemaining(endDate: string) {
  const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

function monthCountdown(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff / (60 * 60 * 1000)) % 24);
  const minutes = Math.floor((diff / (60 * 1000)) % 60);
  return { days, hours, minutes };
}

export default function ChallengesPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ChallengesPayload | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"7" | "30">("7");
  const [message, setMessage] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/challenges", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const payload = (await res.json()) as ChallengesPayload;
        if (!mounted) return;
        setData(payload);

        const free = payload.challenges.find((challenge) => !challenge.isPro);
        const pro = payload.challenges.find((challenge) => challenge.isPro);
        const selectedId = activeTab === "7" ? free?.id : pro?.id;

        if (selectedId) {
          const boardRes = await fetch(`/api/challenges/leaderboard?challengeId=${encodeURIComponent(selectedId)}`, { cache: "no-store" });
          if (boardRes.ok) {
            const boardPayload = (await boardRes.json()) as LeaderboardPayload;
            if (mounted) setLeaderboard(boardPayload);
          }
        }
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [activeTab]);

  const freeChallenge = useMemo(() => data?.challenges.find((challenge) => !challenge.isPro) || null, [data]);
  const proChallenge = useMemo(() => data?.challenges.find((challenge) => challenge.isPro) || null, [data]);
  const countdown = monthCountdown(data?.monthlyCountdown || new Date().toISOString());

  useEffect(() => {
    if (!loading && data) {
      setGuideOpen(true);
    }
  }, [loading, data]);

  async function joinChallenge(challengeId: string) {
    setJoiningId(challengeId);
    setMessage("");

    try {
      const response = await fetch("/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload?.error || "Could not join challenge");
        return;
      }
      setMessage("Challenge joined successfully");
      setActiveTab((freeChallenge?.id === challengeId ? "7" : "30"));
      const refresh = await fetch("/api/challenges", { cache: "no-store" });
      if (refresh.ok) {
        const refreshed = (await refresh.json()) as ChallengesPayload;
        setData(refreshed);
      }
    } catch {
      setMessage("Could not join challenge");
    } finally {
      setJoiningId(null);
    }
  }

  if (loading) {
    return <section className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-300">Loading discipline challenges...</section>;
  }

  if (!data) {
    return <section className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-rose-400">Could not load challenges.</section>;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Discipline Challenges</h1>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="rounded-md border border-blue-500/40 bg-blue-600/15 px-3 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-600/25"
        >
          Challenge Performance Guide
        </button>
      </div>

      <section className="rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-yellow-500/25 p-6">
        <h2 className="text-2xl font-bold text-amber-100">👑 This Month's Champion</h2>
        {data.monthlyChampion ? (
          <div className="mt-3 text-amber-50">
            <p className="text-lg font-semibold">{data.monthlyChampion.displayName}</p>
            <p className="text-sm">Discipline Score: {data.monthlyChampion.disciplineScore.toFixed(2)}</p>
            <p className="mt-1 text-sm">They won 1 month Pro plan free</p>
          </div>
        ) : (
          <div className="mt-3 text-amber-50">
            <p className="text-lg font-semibold">👑 Monthly Champion not declared yet</p>
            <p className="text-sm">Trade consistently to be this month's champion</p>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-emerald-500/35 bg-slate-900 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-white">7-Day Beginner Challenge</h2>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">FREE</span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{freeChallenge?.description || "Perfect for new traders. Build discipline in 7 days."}</p>
          <div className="mt-3 text-xs text-slate-300">
            <p>Days remaining: {freeChallenge ? daysRemaining(freeChallenge.endDate) : 0}</p>
            <p>Participants: {freeChallenge?.participantCount || 0}</p>
            {freeChallenge?.myEntry ? <p>Your rank: #{freeChallenge.myEntry.rank}</p> : null}
          </div>
          <button
            type="button"
            disabled={!freeChallenge || joiningId === freeChallenge.id}
            onClick={() => freeChallenge && joinChallenge(freeChallenge.id)}
            className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {joiningId === freeChallenge?.id ? "Joining..." : "Join Challenge"}
          </button>
          <div className="mt-4 space-y-2">
            {(freeChallenge?.top10 || []).slice(0, 5).map((entry) => (
              <p key={entry.id} className="text-xs text-slate-300">#{entry.rank} {entry.displayName} - {entry.disciplineScore.toFixed(2)}</p>
            ))}
          </div>
        </article>

        <article className="relative rounded-xl border border-amber-500/35 bg-slate-900 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-white">30-Day Discipline Championship</h2>
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200">PRO</span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{proChallenge?.description || "The ultimate test of trading discipline. Pro traders only."}</p>
          <div className="mt-3 text-xs text-slate-300">
            <p>Days remaining: {proChallenge ? daysRemaining(proChallenge.endDate) : 0}</p>
            <p>Participants: {proChallenge?.participantCount || 0}</p>
            {proChallenge?.myEntry ? <p>Your rank: #{proChallenge.myEntry.rank}</p> : null}
          </div>

          {session?.user?.isPro ? (
            <button
              type="button"
              disabled={!proChallenge || joiningId === proChallenge.id}
              onClick={() => proChallenge && joinChallenge(proChallenge.id)}
              className="mt-4 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
            >
              {joiningId === proChallenge?.id ? "Joining..." : "Join Challenge"}
            </button>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-slate-950/75 backdrop-blur-sm">
              <p className="text-lg font-semibold text-white">🔒 Pro Feature</p>
              <p className="mt-1 text-sm text-slate-300">Upgrade to Pro to join this challenge</p>
              <Link href="/pricing" className="mt-3 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400">
                Upgrade Now
              </Link>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {(proChallenge?.top10 || []).slice(0, 5).map((entry) => (
              <p key={entry.id} className="text-xs text-slate-300">#{entry.rank} {entry.displayName} - {entry.disciplineScore.toFixed(2)}</p>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("7")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === "7" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}
          >
            7-Day
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("30")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === "30" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}
          >
            30-Day (Pro)
          </button>
        </div>

        <h3 className="text-lg font-semibold text-white">Full Leaderboard</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Trades</th>
                <th className="px-3 py-2">Rule Breaks</th>
              </tr>
            </thead>
            <tbody>
              {(leaderboard?.entries || []).map((entry) => {
                const topClass = entry.rank === 1 ? "bg-amber-500/15" : entry.rank === 2 ? "bg-slate-300/10" : entry.rank === 3 ? "bg-orange-500/10" : "";
                const yourClass = entry.isCurrentUser ? "ring-1 ring-blue-500/60" : "";
                return (
                  <tr key={entry.id} className={`border-b border-slate-800 ${topClass} ${yourClass}`}>
                    <td className="px-3 py-2 font-semibold">#{entry.rank}</td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{entry.displayName}</span>
                      {entry.rank === 1 ? (
                        <span className="ml-2">{leaderboard?.challenge.isPro ? "🏆" : "🥇"}</span>
                      ) : null}
                      {entry.isPro ? <span className="ml-2 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-black">PRO</span> : null}
                      {entry.isMonthlyChampion ? <span className="ml-2">👑</span> : null}
                    </td>
                    <td className="px-3 py-2">{entry.disciplineScore.toFixed(2)}</td>
                    <td className="px-3 py-2">{entry.totalTrades}</td>
                    <td className="px-3 py-2">{entry.ruleBreaks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}

      <ChallengeGuideBooklet
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        countdownText={`${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`}
        nextWinnerDate={new Date(data.monthlyCountdown).toLocaleDateString()}
        pastChampions={data.pastChampions}
      />
    </main>
  );
}
