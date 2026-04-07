"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Brain, Bolt, Trophy, CandlestickChart } from "lucide-react";

type ContestFilter = "All" | "Beginner" | "Strategy" | "Intraday" | "Sector";

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

interface ContestCard {
  id: string;
  competitionId?: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: Exclude<ContestFilter, "All">;
  title: string;
  description: string;
  prize: string;
  traders: string;
  duration: string;
  capital: string;
  daysLeft: number;
  status: "Live" | "Upcoming";
}

function getCountdown(endDate: string) {
  const total = Math.max(0, new Date(endDate).getTime() - Date.now());
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function pickCategoryFromTitle(title: string): Exclude<ContestFilter, "All"> {
  const normalized = title.toLowerCase();
  if (normalized.includes("intraday")) return "Intraday";
  if (normalized.includes("sector")) return "Sector";
  if (normalized.includes("strategy") || normalized.includes("ai")) return "Strategy";
  if (normalized.includes("beginner") || normalized.includes("first")) return "Beginner";
  return "Strategy";
}

function pickLevel(index: number): ContestCard["level"] {
  if (index % 3 === 0) return "Beginner";
  if (index % 3 === 1) return "Intermediate";
  return "Advanced";
}

function buildContestCards(competitions: Competition[], leaderboard: LeaderboardResponse): ContestCard[] {
  const mapped = competitions.slice(0, 6).map((competition, index) => {
    const category = pickCategoryFromTitle(competition.title);
    const daysLeft = getCountdown(competition.endDate).days;
    const entries = competition._count?.entries ?? leaderboard.entries.length + index * 180;

    return {
      id: competition.id,
      competitionId: competition.id,
      level: pickLevel(index),
      category,
      title: competition.title,
      description: competition.description,
      prize: competition.prizeDescription || `Rs.${(25000 + index * 10000).toLocaleString("en-IN")}`,
      traders: entries.toLocaleString("en-IN"),
      duration: `${Math.max(1, daysLeft + 1)} days`,
      capital: "Rs.100,000",
      daysLeft: Math.max(0, daysLeft),
      status: competition.isActive ? "Live" : "Upcoming",
    } as ContestCard;
  });

  if (mapped.length >= 3) return mapped;

  const fallback: ContestCard[] = [
    {
      id: "first-trade",
      level: "Beginner",
      category: "Beginner",
      title: "First Trade Challenge",
      description: "Perfect for new traders. Learn order types, sizing, and chart basics in a guided sprint.",
      prize: "Rs.25,000",
      traders: "1,240",
      duration: "7 days",
      capital: "Rs.100,000",
      daysLeft: 8,
      status: "Live",
    },
    {
      id: "intraday-blitz",
      level: "Intermediate",
      category: "Intraday",
      title: "Intraday Blitz - Daily",
      description: "Open 9:15 AM close 3:30 PM. Daily intraday contest sharpened for momentum and execution.",
      prize: "Rs.100,000",
      traders: "876",
      duration: "1 day",
      capital: "Rs.200,000",
      daysLeft: 3,
      status: "Live",
    },
    {
      id: "ai-strategy",
      level: "Advanced",
      category: "Strategy",
      title: "AI Strategy Showdown",
      description: "Build and defend a trading strategy. AI coaching score is weighted with returns.",
      prize: "Rs.75,000",
      traders: "412",
      duration: "14 days",
      capital: "Rs.500,000",
      daysLeft: 18,
      status: "Live",
    },
  ];

  return [...mapped, ...fallback].slice(0, 6);
}

export default function CompetitionsPage() {
  const router = useRouter();
  const liveContestsRef = useRef<HTMLDivElement | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse>({ entries: [], yourRank: null });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState("");
  const [suggestDescription, setSuggestDescription] = useState("");
  const [suggestCategory, setSuggestCategory] = useState("Strategy");
  const [suggestPrize, setSuggestPrize] = useState("Rs.50,000");
  const [activeFilter, setActiveFilter] = useState<ContestFilter>("All");

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

  const activeCompetition = useMemo(
    () => competitions.find((competition) => competition.isActive) || leaderboard.competition,
    [competitions, leaderboard.competition],
  );

  useEffect(() => {
    if (!activeCompetition?.endDate) return;

    setCountdown(getCountdown(activeCompetition.endDate));
    const timer = setInterval(() => {
      setCountdown(getCountdown(activeCompetition.endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCompetition?.endDate]);

  async function joinCompetition(competitionId?: string) {
    setJoining(true);
    setMessage("");

    try {
      const response = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitionId }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      setMessage(data?.message || data?.error || "Updated");
    } catch {
      setMessage("Unable to process join request right now.");
    } finally {
      setJoining(false);
    }
  }

  async function notifyCompetition(competitionId: string) {
    setNotifyingId(competitionId);
    setMessage("");

    try {
      const response = await fetch("/api/competitions/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitionId }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      setMessage(data?.message || data?.error || "Notification updated");
    } catch {
      setMessage("Unable to set notification right now.");
    } finally {
      setNotifyingId(null);
    }
  }

  async function submitSuggestion() {
    if (!suggestTitle.trim() || !suggestDescription.trim()) {
      setMessage("Please add a title and description for your contest idea.");
      return;
    }

    setSubmittingSuggestion(true);
    setMessage("");

    try {
      const response = await fetch("/api/competitions/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestTitle.trim(),
          description: suggestDescription.trim(),
          category: suggestCategory,
          prize: suggestPrize,
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      setMessage(data?.message || data?.error || "Suggestion submitted");
      if (response.ok) {
        setSuggestTitle("");
        setSuggestDescription("");
        setShowSuggestForm(false);
      }
    } catch {
      setMessage("Unable to submit suggestion right now.");
    } finally {
      setSubmittingSuggestion(false);
    }
  }

  const allCards = useMemo(() => buildContestCards(competitions, leaderboard), [competitions, leaderboard]);
  const liveCards = useMemo(() => allCards.filter((card) => card.status === "Live"), [allCards]);

  const filteredCards = useMemo(() => {
    if (activeFilter === "All") return liveCards;
    return liveCards.filter((card) => card.category === activeFilter || card.level === activeFilter);
  }, [activeFilter, liveCards]);

  const upcomingCompetitions = useMemo(
    () => competitions.filter((competition) => !competition.isActive || new Date(competition.startDate).getTime() > Date.now()).slice(0, 4),
    [competitions],
  );

  const computedParticipants =
    activeCompetition?._count?.entries !== undefined && activeCompetition?._count?.entries !== null
      ? activeCompetition._count.entries
      : leaderboard.entries.length * 80;
  const participants = computedParticipants || 8240;
  const totalContests = Math.max(competitions.length, 47);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-[var(--text-secondary)]">
        Loading contests...
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-3xl border border-[#18305e] bg-[linear-gradient(180deg,#07142f,#060f24)]">
        <div className="bg-[linear-gradient(90deg,rgba(34,211,238,.08),transparent_35%,rgba(59,130,246,.08))] px-4 py-6 sm:px-6">
          <p className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            {filteredCards.length} live contests now
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">Compete. Learn. Win.</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-300">
            Trade against real traders with virtual capital only. Every contest in TradeSphere uses paper money and simulated execution, never real-money settlement.
          </p>
        </div>

        <div className="grid grid-cols-2 border-t border-[#18305e] sm:grid-cols-4">
          <div className="border-r border-[#18305e] p-4 text-center">
            <p className="text-3xl font-black text-cyan-300">Rs.12.4L</p>
            <p className="mt-1 text-xs text-slate-400">Prize pool this month</p>
          </div>
          <div className="border-r border-[#18305e] p-4 text-center">
            <p className="text-3xl font-black text-slate-100">{participants.toLocaleString("en-IN")}</p>
            <p className="mt-1 text-xs text-slate-400">Active participants</p>
          </div>
          <div className="border-r border-[#18305e] p-4 text-center">
            <p className="text-3xl font-black text-blue-400">{totalContests}</p>
            <p className="mt-1 text-xs text-slate-400">Total contests</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-3xl font-black text-amber-300">92%</p>
            <p className="mt-1 text-xs text-slate-400">Completion rate</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#254171] bg-[#12264a] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">Grand Championship - Live now</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-4xl font-black text-white">{activeCompetition?.title || "NSE Masters Cup 2026 - Season 3"}</h2>
            <p className="mt-3 max-w-xl text-xl text-amber-300">{activeCompetition?.prizeDescription || "Rs.300,000 total prize pool"}</p>
            <p className="mt-4 text-lg text-slate-300">
              {activeCompetition?.description || "India's biggest paper trading championship. 30 days, thousands of traders, real market simulation, zero real money risk."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-300">
                {participants.toLocaleString("en-IN")} joined
              </span>
              <span className="text-slate-300">Duration: 30 days</span>
              <span className="text-slate-300">Capital: Rs.100,000</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#23406f] bg-[#0c1c3b] p-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg border border-[#23406f] bg-[#10244a] p-2"><p className="text-2xl font-black text-white">{countdown.days}</p><p className="text-[10px] text-slate-400">Days</p></div>
              <div className="rounded-lg border border-[#23406f] bg-[#10244a] p-2"><p className="text-2xl font-black text-white">{countdown.hours}</p><p className="text-[10px] text-slate-400">Hrs</p></div>
              <div className="rounded-lg border border-[#23406f] bg-[#10244a] p-2"><p className="text-2xl font-black text-white">{countdown.minutes}</p><p className="text-[10px] text-slate-400">Min</p></div>
              <div className="rounded-lg border border-[#23406f] bg-[#10244a] p-2"><p className="text-2xl font-black text-white">{countdown.seconds}</p><p className="text-[10px] text-slate-400">Sec</p></div>
            </div>

            <button
              type="button"
              onClick={joinCompetition}
              disabled={joining}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#2f5ea6] bg-[#16305e] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1d3c77] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {joining ? "Joining..." : "Join Championship"}
              <ArrowRight size={16} />
            </button>

            {message ? <p className="mt-2 text-center text-xs text-slate-300">{message}</p> : null}
          </div>
        </div>
      </div>

      <div ref={liveContestsRef} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">Live and open to join</h3>
          <div className="flex flex-wrap items-center gap-2">
            {(["All", "Beginner", "Strategy", "Intraday", "Sector"] as ContestFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-[var(--border)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {filteredCards.slice(0, 6).map((card) => (
            <article key={card.id} className="overflow-hidden rounded-2xl border border-[#254171] bg-[#12264a]">
              <div className="p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 font-semibold text-emerald-300">{card.level}</span>
                  <span className="rounded-full bg-blue-500/20 px-2.5 py-1 font-semibold text-blue-300">{card.status}</span>
                </div>

                <h4 className="text-2xl font-bold text-white">{card.title}</h4>
                <p className="mt-2 min-h-[72px] text-sm text-slate-300">{card.description}</p>
              </div>

              <div className="border-t border-[#254171] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Prize pool</p>
                <p className="text-4xl font-black text-cyan-300">{card.prize}</p>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-[#0d1f42] p-2"><p className="font-bold text-white">{card.traders}</p><p className="text-[10px] text-slate-400">Traders</p></div>
                  <div className="rounded-lg bg-[#0d1f42] p-2"><p className="font-bold text-white">{card.duration}</p><p className="text-[10px] text-slate-400">Duration</p></div>
                  <div className="rounded-lg bg-[#0d1f42] p-2"><p className="font-bold text-white">{card.capital}</p><p className="text-[10px] text-slate-400">Capital</p></div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#254171] p-4">
                <p className="text-sm text-slate-300">{card.daysLeft} days left</p>
                <button
                  type="button"
                  onClick={() => joinCompetition(card.competitionId)}
                  disabled={joining}
                  className="rounded-lg border border-[#3f5f9f] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#173568] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Join
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">Contest learning paths</h3>
            <button
              type="button"
              onClick={() => router.push("/ai-coach")}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
            >
              View all tracks
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: CandlestickChart,
                title: "Fundamentals Track",
                description: "Master order types, risk management, and chart reading.",
                progress: "5/8",
                enrolled: "1,840",
                color: "text-cyan-300",
              },
              {
                icon: Bolt,
                title: "Intraday Mastery",
                description: "Daily blitz drills for entries, exits, and scalping.",
                progress: "4/12",
                enrolled: "2,210",
                color: "text-blue-400",
              },
              {
                icon: Brain,
                title: "Behavioral Edge",
                description: "Emotion and discipline coaching for better consistency.",
                progress: "1/6",
                enrolled: "940",
                color: "text-violet-400",
              },
            ].map((track) => (
              <article key={track.title} className="rounded-xl border border-[#254171] bg-[#12264a] p-3">
                <track.icon size={18} className={track.color} />
                <h4 className="mt-2 text-lg font-bold text-white">{track.title}</h4>
                <p className="mt-1 text-sm text-slate-300">{track.description}</p>
                <div className="mt-3 h-1.5 rounded-full bg-[#0b1a36]">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(Number(track.progress.split("/")[0]) / Number(track.progress.split("/")[1])) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{track.progress} completed - {track.enrolled} enrolled</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">Your active battles</h3>
            <span className="text-sm text-cyan-300">Paper portfolio only</span>
          </div>

          <div className="space-y-3">
            {[
              { name: activeCompetition?.title || "NSE Masters Cup", detail: "8 days left - Rs.100,000 capital", rank: "#247", pnl: "+4.8%" },
              { name: "Intraday Blitz", detail: "Today - Rs.200,000 capital", rank: "#43", pnl: "+2.1%" },
              { name: "Stop-Loss Cup", detail: "3 days left - Rs.100,000 capital", rank: "#89", pnl: "-0.4%" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl border border-[#254171] bg-[#12264a] p-3">
                <div>
                  <p className="text-lg font-bold text-white">{item.name}</p>
                  <p className="text-sm text-slate-300">{item.detail}</p>
                </div>
                <div className="text-right">
                  <p className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-300">{item.rank}</p>
                  <p className={`mt-1 text-base font-bold ${item.pnl.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>{item.pnl}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <h3 className="text-2xl font-bold text-[var(--text-primary)]">Upcoming contests</h3>
        <div className="mt-3 space-y-3">
          {upcomingCompetitions.map((item) => {
            const start = new Date(item.startDate);
            const date = `${String(start.getDate()).padStart(2, "0")} ${start.toLocaleString("en-US", { month: "short" }).toUpperCase()}`;

            return (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#254171] bg-[#12264a] p-3">
              <div className="min-w-[64px] rounded-lg border border-[#315896] bg-[#0d1f42] px-3 py-2 text-center">
                <p className="text-xl font-black text-white">{date.split(" ")[0]}</p>
                <p className="text-[10px] text-slate-400">{date.split(" ")[1]}</p>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold text-white">{item.title}</p>
                <p className="text-sm text-slate-300">{item.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-cyan-300">{item.prizeDescription}</p>
                <button
                  type="button"
                  onClick={() => notifyCompetition(item.id)}
                  disabled={notifyingId === item.id}
                  className="mt-2 rounded-lg border border-[#3f5f9f] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#173568] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {notifyingId === item.id ? "Saving..." : "Notify me"}
                </button>
              </div>
            </article>
          )})}
        </div>
      </section>

      <section className="rounded-2xl border border-[#254171] bg-[#12264a] p-5 sm:p-6">
        <div className="grid items-center gap-4 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h3 className="text-4xl font-black text-white">Cannot find the right contest?</h3>
            <p className="mt-2 text-lg text-slate-300">Tell us what challenge format you want and we will launch new paper-trading contests based on demand.</p>
          </div>
          <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
            <button
              type="button"
              onClick={() => setShowSuggestForm((prev) => !prev)}
              className="rounded-xl border border-[#3f5f9f] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#173568]"
            >
              Suggest a contest
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("All");
                liveContestsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Browse all {totalContests}
            </button>
          </div>
        </div>

        {showSuggestForm ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-[#254171] bg-[#0f1f3e] p-4">
            <input
              value={suggestTitle}
              onChange={(event) => setSuggestTitle(event.target.value)}
              placeholder="Contest title"
              className="h-10 rounded-lg border border-[#315896] bg-[#0d1f42] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400"
            />
            <textarea
              value={suggestDescription}
              onChange={(event) => setSuggestDescription(event.target.value)}
              placeholder="Contest description"
              rows={3}
              className="rounded-lg border border-[#315896] bg-[#0d1f42] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={suggestCategory}
                onChange={(event) => setSuggestCategory(event.target.value)}
                className="h-10 rounded-lg border border-[#315896] bg-[#0d1f42] px-3 text-sm text-white outline-none focus:border-blue-400"
              >
                <option>Beginner</option>
                <option>Intraday</option>
                <option>Strategy</option>
                <option>Sector</option>
              </select>
              <input
                value={suggestPrize}
                onChange={(event) => setSuggestPrize(event.target.value)}
                placeholder="Expected prize pool"
                className="h-10 rounded-lg border border-[#315896] bg-[#0d1f42] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400"
              />
            </div>
            <button
              type="button"
              onClick={submitSuggestion}
              disabled={submittingSuggestion}
              className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submittingSuggestion ? "Submitting..." : "Submit suggestion"}
            </button>
          </div>
        ) : null}
      </section>

      <p className="text-center text-xs text-[var(--text-muted)]">Contest rankings are based on simulated paper portfolio performance and are not connected to real-money PnL.</p>
    </section>
  );
}
