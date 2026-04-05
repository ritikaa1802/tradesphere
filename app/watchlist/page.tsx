"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SkeletonTable } from "@/components/Skeleton";

interface StockOption {
  symbol: string;
  name: string;
}

interface WatchlistItem {
  id: string;
  symbol: string;
  addedAt: string;
}

interface WatchlistQuote {
  price: number | null;
  changePercent: number;
}

export default function WatchlistPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockOption[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [quotes, setQuotes] = useState<Record<string, WatchlistQuote>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadWatchlist() {
    try {
      const response = await fetch("/api/watchlist", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load watchlist");
      }
      const data = (await response.json()) as { watchlist: WatchlistItem[] };
      const items = data.watchlist || [];
      setWatchlist(items);

      const quotePairs = await Promise.all(
        items.map(async (item) => {
          const quoteResponse = await fetch(`/api/stocks/price?symbol=${encodeURIComponent(item.symbol)}`, { cache: "no-store" });
          if (!quoteResponse.ok) {
            return [item.symbol, { price: null, changePercent: 0 }] as const;
          }
          const quote = (await quoteResponse.json()) as { price?: number; changePercent?: number };
          return [
            item.symbol,
            {
              price: typeof quote.price === "number" ? quote.price : null,
              changePercent: typeof quote.changePercent === "number" ? quote.changePercent : 0,
            },
          ] as const;
        }),
      );

      setQuotes(Object.fromEntries(quotePairs));
    } catch {
      setMessage("Could not load watchlist");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWatchlist();
    const intervalId = setInterval(loadWatchlist, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(trimmed)}`);
        const data = (await response.json()) as { stocks?: StockOption[] };
        setResults(data.stocks || []);
      } catch {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  async function addToWatchlist(symbol: string) {
    setMessage("");
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      if (!response.ok) {
        throw new Error("Failed to add");
      }

      setQuery("");
      setResults([]);
      await loadWatchlist();
    } catch {
      setMessage("Could not add symbol to watchlist");
    }
  }

  async function removeFromWatchlist(symbol: string) {
    setMessage("");
    try {
      const response = await fetch(`/api/watchlist/${encodeURIComponent(symbol)}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to remove");
      }
      await loadWatchlist();
    } catch {
      setMessage("Could not remove symbol");
    }
  }

  const watchlistSymbols = useMemo(() => new Set(watchlist.map((item) => item.symbol)), [watchlist]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">Watchlist</h1>
          <p className="mt-2 text-slate-400">Track your favorite stocks and jump into trading quickly.</p>

          <div className="mt-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search and add stocks"
              className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            />
            {results.length > 0 ? (
              <div className="mt-2 rounded border border-slate-700 bg-slate-950">
                {results.map((item) => (
                  <button
                    key={item.symbol}
                    type="button"
                    disabled={watchlistSymbols.has(item.symbol)}
                    onClick={() => addToWatchlist(item.symbol)}
                    className="flex w-full items-center justify-between border-b border-slate-800 px-3 py-2 text-left text-sm text-slate-200 transition last:border-b-0 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>{item.name} ({item.symbol})</span>
                    <span className="text-blue-300">{watchlistSymbols.has(item.symbol) ? "Added" : "Add"}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          {loading ? (
            <SkeletonTable rows={5} />
          ) : watchlist.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center">
              <p className="text-xl font-semibold text-white">Your watchlist is empty</p>
              <p className="mt-2 text-sm text-slate-400">Search and add stocks to monitor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="py-2">Symbol</th>
                    <th className="py-2">Current Price</th>
                    <th className="py-2">Change %</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((item) => {
                    const quote = quotes[item.symbol];
                    const change = quote?.changePercent || 0;
                    return (
                      <tr key={item.id} className="border-b border-slate-800">
                        <td className="py-3 font-semibold text-white">{item.symbol}</td>
                        <td className="py-3 text-slate-300">{typeof quote?.price === "number" ? `₹${quote.price.toFixed(2)}` : "-"}</td>
                        <td className={`py-3 font-semibold ${change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                          {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Link href={`/trade?symbol=${encodeURIComponent(item.symbol)}`} className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500">
                              Add to Trade
                            </Link>
                            <button
                              onClick={() => removeFromWatchlist(item.symbol)}
                              className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
