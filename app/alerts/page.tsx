"use client";

import { FormEvent, useEffect, useState } from "react";

interface AlertItem {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: string;
  triggered: boolean;
  currentPrice: number | null;
  createdAt: string;
}

export default function AlertsPage() {
  const [symbol, setSymbol] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState("above");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadAlerts() {
    try {
      const response = await fetch("/api/alerts", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load");
      }
      const data = (await response.json()) as { alerts: AlertItem[] };
      setAlerts(data.alerts || []);
    } catch {
      setMessage("Could not load alerts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
    const intervalId = setInterval(loadAlerts, 30000);
    return () => clearInterval(intervalId);
  }, []);

  async function createAlert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.trim().toUpperCase(),
          targetPrice: Number(targetPrice),
          condition,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "Could not create alert");
        return;
      }

      setSymbol("");
      setTargetPrice("");
      await loadAlerts();
    } catch {
      setMessage("Could not create alert");
    }
  }

  async function deleteAlert(id: string) {
    setMessage("");
    try {
      const response = await fetch(`/api/alerts/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete");
      }
      await loadAlerts();
    } catch {
      setMessage("Could not delete alert");
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">Price Alerts</h1>
          <p className="mt-2 text-slate-400">Create alerts for price moves above or below your target.</p>

          <form onSubmit={createAlert} className="mt-4 grid gap-3 md:grid-cols-4">
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="Symbol"
              className="rounded border border-slate-700 bg-slate-900 p-2"
              required
            />
            <input
              value={targetPrice}
              onChange={(event) => setTargetPrice(event.target.value)}
              type="number"
              step="0.01"
              placeholder="Target price"
              className="rounded border border-slate-700 bg-slate-900 p-2"
              required
            />
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className="rounded border border-slate-700 bg-slate-900 p-2"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
              Create Alert
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          {loading ? (
            <p className="text-slate-400">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="text-slate-400">No alerts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="py-2">Symbol</th>
                    <th className="py-2">Condition</th>
                    <th className="py-2">Target</th>
                    <th className="py-2">Current</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="border-b border-slate-800">
                      <td className="py-3 font-semibold text-white">{alert.symbol}</td>
                      <td className="py-3 text-slate-300">{alert.condition === "above" ? "Above" : "Below"}</td>
                      <td className="py-3 text-slate-300">₹{alert.targetPrice.toFixed(2)}</td>
                      <td className="py-3 text-slate-300">{typeof alert.currentPrice === "number" ? `₹${alert.currentPrice.toFixed(2)}` : "-"}</td>
                      <td className="py-3">
                        {alert.triggered ? (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">TRIGGERED</span>
                        ) : (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-300">ACTIVE</span>
                        )}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {message ? <p className="mt-3 text-sm text-amber-300">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}
