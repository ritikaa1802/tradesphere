"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mistake } from "@/lib/mistakes";
import { SkeletonCard } from "@/components/Skeleton";

type MistakeCategory = "panic" | "overtrading" | "other";

function getCategory(type: string): MistakeCategory {
  const normalized = type.trim().toLowerCase();
  if (normalized.includes("panic")) return "panic";
  if (normalized.includes("overtrading")) return "overtrading";
  return "other";
}

function categoryBadgeClasses(category: MistakeCategory): string {
  if (category === "panic") return "bg-rose-500/20 text-rose-300 border border-rose-500/30";
  if (category === "overtrading") return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
}

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLesson, setShowLesson] = useState(false);
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

  const panicCount = mistakes.filter((mistake) => getCategory(mistake.type) === "panic").length;
  const overtradingCount = mistakes.filter((mistake) => getCategory(mistake.type) === "overtrading").length;
  const otherCount = mistakes.filter((mistake) => getCategory(mistake.type) === "other").length;

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

        <div className="rounded-lg border border-slate-800 bg-[#0f1629] p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.9)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-white">Trading Mistakes</h1>
              <p className="mt-2 text-slate-400">Clean behavior report to help you improve decision quality.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total mistakes detected</p>
              <p className="text-3xl font-bold text-white">{mistakes.length}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-sm font-semibold text-rose-300">
              {panicCount} Panic Sell{panicCount === 1 ? "" : "s"}
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-300">
              {overtradingCount} Overtrading
            </span>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-sm font-semibold text-blue-300">
              {otherCount} Other
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0f1629] p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.9)]">

          {mistakes.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="mb-2 text-xl font-semibold text-green-400">Great job! 🎉 No mistakes detected</p>
              <p className="text-slate-400">Keep trading with discipline.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mistakes.map((mistake, index) => {
                const category = getCategory(mistake.type);
                const soldPrice = mistake.trade.price;
                const movedAmount = mistake.trade.pnl ?? 0;
                const boughtPrice = soldPrice - movedAmount / Math.max(1, mistake.trade.quantity);

                return (
                  <article
                    key={`${mistake.trade.id}-${mistake.type}-${index}`}
                    className="rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${categoryBadgeClasses(category)}`}>
                          {mistake.type}
                        </span>
                        <h3 className="mt-3 text-2xl font-semibold text-white">{mistake.description}</h3>
                        <p className="mt-2 text-base text-slate-300">{mistake.why}</p>
                        <p className="mt-3 text-lg text-slate-200">
                          <span className="font-semibold text-white">Fix:</span> {mistake.suggestion}
                        </p>
                        <p className="mt-3 text-sm text-slate-500">{new Date(mistake.trade.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="w-full rounded-lg border border-slate-700 bg-[#0b1220] p-3 md:w-[230px]">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Bought at → Sold at</p>
                        <p className="mt-1 text-3xl font-bold text-slate-100">
                          ₹{boughtPrice.toFixed(0)} → ₹{soldPrice.toFixed(0)}
                        </p>
                        <p className={`mt-2 text-xl font-semibold ${movedAmount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {movedAmount >= 0 ? "+" : ""}₹{Math.abs(movedAmount).toFixed(0)}
                        </p>
                        {movedAmount >= 0 ? (
                          <p className="mt-1 text-sm text-emerald-300">Missed profit opportunity</p>
                        ) : (
                          <p className="mt-1 text-sm text-rose-300">Loss impact after exit</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}