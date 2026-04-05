"use client";

import { useState } from "react";

const freeFeatures = [
  "Virtual ₹1,00,000",
  "Basic portfolio tracking",
  "Trade history",
  "Basic dashboard",
  "1 AI report per month",
  "Leaderboard access",
];

const proFeatures = [
  "Everything in Free",
  "Unlimited AI Coach reports",
  "Full insight breakdown",
  "Loss breakdown details",
  "Weekly email report",
  "Export CSV",
  "Pro badge on leaderboard",
  "Advanced mistake detection",
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function upgrade() {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/pro/upgrade", { method: "POST" });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data?.error || "Could not upgrade plan");
      setLoading(false);
      return;
    }

    setMessage(data?.message || "Pro activated");
    setLoading(false);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6">
          <h1 className="text-3xl font-semibold text-white">Choose Your Plan</h1>
          <p className="mt-2 text-slate-400">Upgrade anytime to unlock deeper analytics and automation.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6">
            <h2 className="text-2xl font-bold text-white">FREE</h2>
            <p className="mt-1 text-slate-400">₹0/month</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {freeFeatures.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border border-amber-500 bg-[#1a1421] p-6">
            <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-black">Most Popular</span>
            <h2 className="text-2xl font-bold text-white">PRO</h2>
            <p className="mt-1 text-amber-300">₹299/month</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {proFeatures.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={upgrade}
              disabled={loading}
              className="mt-6 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-70"
            >
              {loading ? "Activating..." : "Activate Pro"}
            </button>
            {message ? <p className="mt-3 text-sm text-amber-200">{message}</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
