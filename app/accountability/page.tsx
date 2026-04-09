"use client";

import { FormEvent, useEffect, useState } from "react";

type Summary = {
  id: string;
  userId: string;
  tradeCount: number;
  winRate: number;
  ruleBreaks: number;
  disciplineScore: number;
  checklistCompletionRate: number;
};

type WeeklySummaryResponse = {
  mySummary: Summary;
  partner: { id: string; displayName: string | null; email: string } | null;
  partnerSummary: Summary | null;
  pair?: { id: string };
  pendingReview: boolean;
};

export default function AccountabilityPage() {
  const [data, setData] = useState<WeeklySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [goodPoints, setGoodPoints] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [suggestions, setSuggestions] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadSummary() {
      try {
        const response = await fetch("/api/accountability/weekly-summary", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load weekly summary");
        const payload = (await response.json()) as WeeklySummaryResponse;
        if (mounted) setData(payload);
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      mounted = false;
    };
  }, []);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data?.pair?.id || !data.partner?.id) return;

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/accountability/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pairId: data.pair.id,
          reviewedUserId: data.partner.id,
          goodPoints,
          mistakes,
          suggestions,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload?.error || "Could not submit review");
        return;
      }

      setMessage("Partner review submitted successfully");
      setData({ ...data, pendingReview: false });
      setGoodPoints("");
      setMistakes("");
      setSuggestions("");
    } catch {
      setMessage("Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#9ca3af]">Loading accountability data...</section>;
  }

  if (!data) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-rose-400">Could not load accountability data.</section>;
  }

  const partnerName = data.partner?.displayName || data.partner?.email?.split("@")[0] || "Partner";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="rounded-xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_20px_70px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">Accountability Partners</h1>
          <p className="mt-2 text-slate-400">Weekly reflection with structured partner feedback.</p>

          {data.pendingReview ? (
            <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
              You haven't reviewed your partner yet this week.
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              Weekly partner review completed.
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Your week</p>
            <p className="mt-1 text-lg font-semibold text-white">Discipline Score: {data.mySummary.disciplineScore}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p>Trades: {data.mySummary.tradeCount}</p>
              <p>Win Rate: {data.mySummary.winRate.toFixed(1)}%</p>
              <p>Rule Breaks: {data.mySummary.ruleBreaks}</p>
              <p>Checklist Completion: {(data.mySummary.checklistCompletionRate * 100).toFixed(1)}%</p>
            </div>
          </article>

          <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">{partnerName}'s week</p>
            {data.partnerSummary ? (
              <>
                <p className="mt-1 text-lg font-semibold text-white">Discipline Score: {data.partnerSummary.disciplineScore}</p>
                <div className="mt-3 space-y-1 text-sm text-slate-300">
                  <p>Trades: {data.partnerSummary.tradeCount}</p>
                  <p>Win Rate: {data.partnerSummary.winRate.toFixed(1)}%</p>
                  <p>Rule Breaks: {data.partnerSummary.ruleBreaks}</p>
                  <p>Checklist Completion: {(data.partnerSummary.checklistCompletionRate * 100).toFixed(1)}%</p>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No partner summary available yet.</p>
            )}
          </article>
        </section>

        {data.partner && data.pendingReview ? (
          <section className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">Review {partnerName}</h2>
            <p className="mt-1 text-sm text-slate-400">Share constructive weekly feedback.</p>

            <form onSubmit={submitReview} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-300">What was good</label>
                <textarea
                  value={goodPoints}
                  onChange={(event) => setGoodPoints(event.target.value)}
                  className="h-24 w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">What mistakes you noticed</label>
                <textarea
                  value={mistakes}
                  onChange={(event) => setMistakes(event.target.value)}
                  className="h-24 w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">Suggestions</label>
                <textarea
                  value={suggestions}
                  onChange={(event) => setSuggestions(event.target.value)}
                  className="h-24 w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              {message ? <p className="text-sm text-slate-300">{message}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}
