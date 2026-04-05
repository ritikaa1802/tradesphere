"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileClock } from "lucide-react";
import ProGate from "@/components/ProGate";

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
  const [exporting, setExporting] = useState(false);
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

  async function exportCsv() {
    setExporting(true);
    try {
      const response = await fetch("/api/export/csv", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const fileNameMatch = disposition.match(/filename=([^;]+)/i);
      const fileName = (fileNameMatch?.[1] || "tradesphere-trades.csv").replace(/\"/g, "");

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-white">Trade History</h1>
              <p className="mt-2 text-slate-400">Review and filter your executed trades with confidence.</p>
            </div>
            <ProGate>
              <button
                type="button"
                onClick={exportCsv}
                disabled={exporting}
                className="rounded-lg bg-[#22c55e] px-4 py-2 text-sm font-semibold text-black hover:bg-[#16a34a] disabled:opacity-70"
              >
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </ProGate>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-slate-800 bg-[#0f1629] p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)] md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Stock</label>
            <input
              type="text"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              placeholder="Filter by stock"
              className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            >
              <option value="">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-8 text-center shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
              <FileClock size={22} />
            </div>
            <p className="mt-3 text-slate-300">No trades found for your current filters.</p>
            <Link href="/trade" className="mt-3 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300">
              Place your first trade →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-[#0f1629] p-3 sm:p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
            <table className="min-w-[760px] text-sm text-slate-200">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-2 pr-3 text-left">Date & Time</th>
                  <th className="py-2 pr-3 text-left">Stock</th>
                  <th className="py-2 pr-3 text-left">Type</th>
                  <th className="py-2 pr-3 text-right">Price</th>
                  <th className="hidden py-2 pr-3 text-right sm:table-cell">Quantity</th>
                  <th className="hidden py-2 pr-3 text-right md:table-cell">Charges</th>
                  <th className="py-2 pr-3 text-right">P&L</th>
                  <th className="hidden py-2 pr-3 text-left lg:table-cell">Note</th>
                  <th className="hidden py-2 text-left md:table-cell">Mood</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-slate-700">
                    <td className="py-2 pr-3">{new Date(trade.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-3">{trade.stock}</td>
                    <td className={`py-2 pr-3 font-semibold ${trade.type === "buy" ? "text-green-400" : "text-red-400"}`}>
                      {trade.type.toUpperCase()}
                    </td>
                    <td className="py-2 pr-3 text-right">₹{trade.price.toFixed(2)}</td>
                    <td className="hidden py-2 pr-3 text-right sm:table-cell">{trade.quantity}</td>
                    <td className="hidden py-2 pr-3 text-right md:table-cell">₹{trade.charges.toFixed(2)}</td>
                    <td className="py-2 pr-3 text-right">
                      {trade.type === "sell" && trade.pnl !== null ? (
                        <span className={trade.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                          ₹{trade.pnl.toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="hidden py-2 pr-3 lg:table-cell">{trade.note || "-"}</td>
                    <td className="hidden py-2 md:table-cell">{trade.mood || "-"}</td>
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