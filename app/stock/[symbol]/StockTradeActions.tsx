"use client";

import { useState } from "react";

type Side = "buy" | "sell";

export default function StockTradeActions({ symbol, currentPrice }: { symbol: string; currentPrice: number }) {
  const [selectedSide, setSelectedSide] = useState<Side | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [emotionalState, setEmotionalState] = useState("");
  const [followedPlan, setFollowedPlan] = useState("");
  const [tradeReason, setTradeReason] = useState("");

  const canSubmit = Boolean(selectedSide && emotionalState && followedPlan && tradeReason.trim() && quantity > 0);

  async function placeTrade() {
    if (!selectedSide || !canSubmit) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: symbol,
          type: selectedSide,
          orderType: "market",
          targetPrice: null,
          price: currentPrice,
          quantity,
          note: `Placed from stock screen (${symbol})`,
          emotionalState,
          followedPlan,
          tradeReason: tradeReason.trim().slice(0, 100),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "Could not place trade");
        return;
      }

      setMessage("Trade placed successfully");
      setSelectedSide(null);
      setEmotionalState("");
      setFollowedPlan("");
      setTradeReason("");
    } catch {
      setMessage("Could not place trade");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setSelectedSide("buy")}
          className="rounded-lg bg-[#14532d] px-4 py-2 text-sm font-semibold text-[#22c55e] hover:brightness-110"
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSelectedSide("sell")}
          className="rounded-lg bg-[#7f1d1d] px-4 py-2 text-sm font-semibold text-[#ef4444] hover:brightness-110"
        >
          Sell
        </button>
      </div>

      {selectedSide ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0b1220] p-5">
            <h3 className="text-xl font-semibold text-white">Emotional Check-In (Required)</h3>
            <p className="mt-1 text-sm text-slate-400">Complete this before confirming your {selectedSide.toUpperCase()} order.</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-200">Quantity</p>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                  className="mt-2 h-10 w-full rounded border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-200">Emotional state</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {["Confident", "Anxious", "Impulsive", "Calm"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setEmotionalState(option)}
                      className={`rounded border px-3 py-2 text-sm ${
                        emotionalState === option
                          ? "border-blue-400 bg-blue-500/20 text-blue-100"
                          : "border-slate-700 bg-slate-900 text-slate-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-200">Followed plan?</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {["Yes", "Partially", "No"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFollowedPlan(option)}
                      className={`rounded border px-3 py-2 text-sm ${
                        followedPlan === option
                          ? "border-blue-400 bg-blue-500/20 text-blue-100"
                          : "border-slate-700 bg-slate-900 text-slate-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-200">Trade reason</p>
                <textarea
                  value={tradeReason}
                  onChange={(event) => setTradeReason(event.target.value.slice(0, 100))}
                  maxLength={100}
                  className="mt-2 h-24 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                  placeholder="Why are you making this trade?"
                />
                <p className="mt-1 text-right text-xs text-slate-500">{tradeReason.length}/100</p>
              </div>
            </div>

            {message ? <p className="mt-3 text-sm text-amber-300">{message}</p> : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedSide(null)}
                className="w-1/3 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSubmit || loading}
                onClick={placeTrade}
                className="w-2/3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Check-In & Place Trade"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
