"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      <main className="mx-auto flex min-h-screen w-full max-w-6xl p-6">
        <div className="w-full">
          <h1 className="mb-4 text-3xl font-bold">Trading Mistakes</h1>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl p-6">
        <div className="w-full">
          <h1 className="mb-4 text-3xl font-bold">Trading Mistakes</h1>
          <p className="text-rose-400">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl p-6">
      <div className="w-full">
        <h1 className="mb-4 text-3xl font-bold">Trading Mistakes</h1>

        <div className="mb-6">
          <p className="text-lg">
            Total Mistakes Detected: <span className="font-bold text-rose-400">{mistakes.length}</span>
          </p>
        </div>

        {mistakes.length === 0 ? (
          <div className="rounded bg-slate-800 p-8 text-center">
            <p className="text-xl font-semibold text-green-400 mb-2">🎉 No Mistakes Found!</p>
            <p className="text-slate-400">Keep up the good trading habits. Continue monitoring your patterns.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mistakes.map((mistake, index) => (
              <div key={index} className="rounded bg-slate-800 p-4 border border-slate-700">
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-rose-600 text-white">
                    {mistake.type}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{mistake.description}</h3>
                <div className="mb-2">
                  <p className="text-sm text-slate-400 mb-1">
                    <strong>Why harmful:</strong> {mistake.why}
                  </p>
                  <p className="text-sm text-green-400">
                    <strong>Suggestion:</strong> {mistake.suggestion}
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  Trade on {mistake.trade.createdAt.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/dashboard" className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}