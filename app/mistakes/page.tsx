"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mistake } from "@/lib/mistakes";

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchMistakes();
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
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="mb-4 text-3xl font-semibold text-white">Trading Mistakes</h1>
          <p className="text-slate-400">Loading...</p>
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
              <p className="text-xl font-semibold text-green-400 mb-2">🎉 No Mistakes Found!</p>
              <p className="text-slate-400">Keep up the good trading habits. Continue monitoring your patterns.</p>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}