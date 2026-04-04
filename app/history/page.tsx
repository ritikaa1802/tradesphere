"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Trade {
  id: string;
  stock: string;
  type: string;
  price: number;
  quantity: number;
  charges: number;
  pnl: number | null;
  note: string | null;
  mood: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    filterTrades();
  }, [trades, dateFrom, dateTo, stockFilter, typeFilter]);

  async function fetchTrades() {
    try {
      const res = await fetch("/api/trades");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch trades");
      }
      const data = await res.json();
      setTrades(data);
    } catch (err) {
      setError("Failed to load trade history");
    } finally {
      setLoading(false);
    }
  }

  function filterTrades() {
    let filtered = trades;

    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter(t => new Date(t.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.createdAt) <= to);
    }

    if (stockFilter) {
      filtered = filtered.filter(t => t.stock.toLowerCase().includes(stockFilter.toLowerCase()));
    }

    if (typeFilter) {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    setFilteredTrades(filtered);
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="mb-4 text-3xl font-semibold text-white">Trade History</h1>
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="mb-4 text-3xl font-semibold text-white">Trade History</h1>
          <p className="text-rose-400">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">Trade History</h1>
          <p className="mt-2 text-slate-400">Review and filter your executed trades with confidence.</p>
        </div>

        <div className="grid gap-4 rounded-3xl border border-slate-800 bg-[#0f1629] p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)] md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded border border-slate-700 bg-slate-900 p-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded border border-slate-700 bg-slate-900 p-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Stock</label>
            <input
              type="text"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              placeholder="Filter by stock"
              className="rounded border border-slate-700 bg-slate-900 p-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded border border-slate-700 bg-slate-900 p-2"
            >
              <option value="">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <p className="text-slate-500">No trades found.</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#0f1629] p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
            <table className="min-w-full text-sm text-slate-200">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2">Date & Time</th>
                  <th className="text-left py-2">Stock</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="text-right py-2">Charges</th>
                  <th className="text-right py-2">P&L</th>
                  <th className="text-left py-2">Note</th>
                  <th className="text-left py-2">Mood</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-slate-700">
                    <td className="py-2">{new Date(trade.createdAt).toLocaleString()}</td>
                    <td className="py-2">{trade.stock}</td>
                    <td className={`py-2 font-semibold ${trade.type === "buy" ? "text-green-400" : "text-red-400"}`}>
                      {trade.type.toUpperCase()}
                    </td>
                    <td className="text-right py-2">₹{trade.price.toFixed(2)}</td>
                    <td className="text-right py-2">{trade.quantity}</td>
                    <td className="text-right py-2">₹{trade.charges.toFixed(2)}</td>
                    <td className="text-right py-2">
                      {trade.type === "sell" && trade.pnl !== null ? (
                        <span className={trade.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                          ₹{trade.pnl.toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2">{trade.note || "-"}</td>
                    <td className="py-2">{trade.mood || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}