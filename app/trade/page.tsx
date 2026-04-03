"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TradePage() {
  const [stock, setStock] = useState("");
  const [type, setType] = useState("buy");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock, type, price: Number(price), quantity: Number(quantity), note, mood }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Trade submission failed");
      } else {
        setMessage("Trade saved successfully");
        router.push("/dashboard");
      }
    } catch (err) {
      setMessage("Trade submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <h1 className="mb-4 text-3xl font-bold">Place Trade</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded bg-slate-800 p-5">
        <div>
          <label className="mb-1 block text-sm">Stock</label>
          <input value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 p-2" required />
        </div>
        <div>
          <label className="mb-1 block text-sm">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 p-2">
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" className="w-full rounded border border-slate-700 bg-slate-900 p-2" required />
        </div>
        <div>
          <label className="mb-1 block text-sm">Quantity</label>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" className="w-full rounded border border-slate-700 bg-slate-900 p-2" required />
        </div>
        <div>
          <label className="mb-1 block text-sm">Note</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-900 p-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm">Mood</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["Confident", "Anxious", "Neutral", "FOMO", "Greedy", "Fearful"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`rounded p-2 text-sm font-medium transition-colors ${
                  mood === m
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        {message && <p className="text-sm text-amber-300">{message}</p>}
        <button type="submit" disabled={loading} className="w-full rounded bg-indigo-600 py-2">
          {loading ? "Submitting..." : "Place Trade"}
        </button>
      </form>
    </main>
  );
}
