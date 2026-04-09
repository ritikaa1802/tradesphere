"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mistake } from "@/lib/mistakes";
import { SkeletonCard } from "@/components/Skeleton";

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLesson, setShowLesson] = useState(false);
  const [activeReplay, setActiveReplay] = useState<string | null>(null);
  const [replayProgress, setReplayProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchMistakes();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadLessonState() {
      try {
        const response = await fetch("/api/lessons", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { shownLessons?: string[] };
        if (mounted && !(data.shownLessons || []).includes("mistakes-intro")) {
          setShowLesson(true);
        }
      } catch {
        // Ignore lesson loading failures.
      }
    }

    loadLessonState();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeReplay) return;
    setReplayProgress(0);
    const interval = setInterval(() => {
      setReplayProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [activeReplay]);

  async function fetchMistakes() {
    try {
      const res = await fetch("/api/analytics/mistakes");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch mistakes");
      }
      const data = await res.json();
      setMistakes(data);
    } catch (err) {
      setError("Failed to load mistakes");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
            <div className="animate-skeleton h-8 w-56 rounded bg-[#1a2744]" />
            <div className="animate-skeleton mt-3 h-4 w-72 max-w-full rounded bg-[#1a2744]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={`mistake-skeleton-${index}`} className="h-44" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="mb-4 text-3xl font-semibold text-white">Trading Mistakes</h1>
          <p className="text-rose-400">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {showLesson ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0b1220] p-5">
              <h3 className="text-xl font-semibold text-white">How to learn from mistakes</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                <li>Panic Sell: Exiting too early due to fear.</li>
                <li>Revenge Trade: Re-entering impulsively after a loss.</li>
                <li>Overtrading: Too many low-quality trades in one session.</li>
                <li>FOMO Entry: Chasing momentum without setup validation.</li>
              </ul>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/lessons", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ lessonKey: "mistakes-intro" }),
                  });
                  setShowLesson(false);
                }}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Got it
              </button>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">Trading Mistakes</h1>
          <p className="mt-2 text-slate-400">Monitor your biggest trading mistakes and avoid repeating them.</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <div className="mb-6">
            <p className="text-lg text-slate-200">
              Total Mistakes Detected: <span className="font-bold text-rose-400">{mistakes.length}</span>
            </p>
          </div>

          {mistakes.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="mb-2 text-xl font-semibold text-green-400">Great job! 🎉 No mistakes detected</p>
              <p className="text-slate-400">Keep trading with discipline.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mistakes.map((mistake, index) => (
                <div key={index} className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm transition hover:border-blue-500">
                  <div className="mb-3">
                    <span className="inline-flex rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
                      {mistake.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{mistake.description}</h3>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>
                      <span className="font-semibold text-slate-100">Why harmful:</span> {mistake.why}
                    </p>
                    <p className="text-emerald-300">
                      <span className="font-semibold text-slate-100">Suggestion:</span> {mistake.suggestion}
                    </p>
                  </div>
                  <div className="mt-4 text-xs text-slate-500">
                    Trade on {mistake.trade.createdAt.toLocaleString()}
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-700 bg-[#0b1220] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mistake Replay</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                      <div className="rounded bg-slate-800 p-2">
                        <p className="text-slate-400">Entry</p>
                        <p className="font-semibold text-white">₹{mistake.trade.price.toFixed(2)}</p>
                      </div>
                      <div className="rounded bg-slate-800 p-2">
                        <p className="text-slate-400">Price Move</p>
                        <p className="font-semibold text-amber-300">
                          {mistake.trade.pnl !== null ? `${mistake.trade.pnl >= 0 ? "+" : ""}${mistake.trade.pnl.toFixed(2)}` : "N/A"}
                        </p>
                      </div>
                      <div className="rounded bg-slate-800 p-2">
                        <p className="text-slate-400">Exit</p>
                        <p className="font-semibold text-white">
                          ₹{(mistake.trade.price + ((mistake.trade.pnl || 0) / Math.max(1, mistake.trade.quantity))).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-rose-300">You made this mistake here.</p>
                    <p className="mt-1 text-xs text-emerald-300">What you should have done instead: {mistake.suggestion}</p>

                    <button
                      type="button"
                      onClick={() => setActiveReplay(activeReplay === mistake.trade.id ? null : mistake.trade.id)}
                      className="mt-3 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      {activeReplay === mistake.trade.id ? "Hide Replay" : "Replay"}
                    </button>

                    {activeReplay === mistake.trade.id ? (
                      <div className="mt-3">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500" style={{ width: `${replayProgress}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">Replaying trade timeline... {replayProgress}%</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}