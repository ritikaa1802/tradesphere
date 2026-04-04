"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface StockOption {
  symbol: string;
  name: string;
}

export default function TradePage() {
  const [stock, setStock] = useState("");
  const [stockQuery, setStockQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [stockSuggestions, setStockSuggestions] = useState<StockOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [type, setType] = useState("buy");
  const [price, setPrice] = useState("");
  const [autoFillPrice, setAutoFillPrice] = useState(true);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [livePriceStatus, setLivePriceStatus] = useState<"idle" | "loading" | "error">("idle");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchContainerRef.current) {
        return;
      }

      if (!searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const query = stockQuery.trim();

    if (!query) {
      setStockSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { stocks?: StockOption[] };
        setStockSuggestions(data.stocks || []);
        setShowSuggestions(true);
      } catch {
        setStockSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [stockQuery]);

  useEffect(() => {
    if (!selectedStock?.symbol) {
      return;
    }

    const intervalId = setInterval(() => {
      loadLivePrice(selectedStock.symbol);
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedStock?.symbol]);

  async function loadLivePrice(symbol: string) {
    setLivePriceStatus("loading");

    try {
      const response = await fetch(`/api/stocks/price?symbol=${encodeURIComponent(symbol)}`);
      const data = (await response.json()) as { price?: number };

      if (!response.ok || typeof data.price !== "number") {
        setLivePrice(null);
        setLivePriceStatus("error");
        return;
      }

      setLivePrice(data.price);
      if (autoFillPrice) {
        setPrice(data.price.toFixed(2));
      }
      setLivePriceStatus("idle");
    } catch {
      setLivePrice(null);
      setLivePriceStatus("error");
    }
  }

  function selectStock(option: StockOption) {
    setSelectedStock(option);
    setStock(option.symbol);
    setStockQuery(`${option.name} (${option.symbol})`);
    setAutoFillPrice(true);
    setShowSuggestions(false);
    setMessage("");
    loadLivePrice(option.symbol);
  }

  const numericPrice = Number(price) || 0;
  const numericQuantity = Number(quantity) || 0;
  const tradeValue = numericPrice * numericQuantity;
  const estimatedCharges = numericPrice > 0 && numericQuantity > 0
    ? 20 + (type === "buy" ? 0.001 * tradeValue : 0)
    : 0;
  const estimatedTotal = type === "buy"
    ? tradeValue + estimatedCharges
    : tradeValue - estimatedCharges;

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setLoading(true);
    setMessage("");

    if (!stock) {
      setLoading(false);
      setMessage("Please select a stock from the search results");
      return;
    }

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
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">Place Trade</h1>
          <p className="mt-2 text-slate-400">Add a new trade with a consistent and modern order entry experience.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
        <div className="relative" ref={searchContainerRef}>
          <label className="mb-1 block text-sm">Stock</label>
          <input
            value={stockQuery}
            onChange={(e) => {
              setStockQuery(e.target.value);
              setSelectedStock(null);
              setStock("");
            }}
            onFocus={() => {
              if (stockSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search stock (e.g. Reliance, TCS, INFY)"
            className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            required
          />
          {showSuggestions && (
            <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded border border-slate-700 bg-slate-950 shadow-lg">
              {isSearching ? (
                <p className="px-3 py-2 text-sm text-slate-400">Searching...</p>
              ) : stockSuggestions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-400">No matching stocks</p>
              ) : (
                stockSuggestions.map((option) => (
                  <button
                    key={option.symbol}
                    type="button"
                    onClick={() => selectStock(option)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                  >
                    <span>{option.name}</span>
                    <span className="font-semibold text-blue-300">{option.symbol}</span>
                  </button>
                ))
              )}
            </div>
          )}
          {selectedStock && (
            <p className="mt-2 text-xs text-slate-400">
              Selected: <span className="text-slate-200">{selectedStock.name}</span> ({selectedStock.symbol})
            </p>
          )}
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
          <input
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setAutoFillPrice(false);
            }}
            type="number"
            step="0.01"
            className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            required
          />
          {livePriceStatus === "loading" && <p className="mt-2 text-xs text-blue-300">Fetching live price...</p>}
          {livePrice !== null && livePriceStatus !== "loading" && <p className="mt-2 text-xs text-emerald-300">Live price: ₹{livePrice.toFixed(2)}</p>}
          {livePriceStatus === "error" && <p className="mt-2 text-xs text-amber-300">Live price unavailable right now. You can still enter price manually.</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm">Quantity</label>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" className="w-full rounded border border-slate-700 bg-slate-900 p-2" required />
        </div>
        <div className="rounded border border-slate-700 bg-slate-900/70 p-3 text-sm">
          <p className="text-slate-300">Estimated charges: <span className="font-semibold text-white">₹{estimatedCharges.toFixed(2)}</span></p>
          <p className="mt-1 text-slate-300">
            Estimated {type === "buy" ? "total cost" : "proceeds"}: <span className="font-semibold text-white">₹{estimatedTotal.toFixed(2)}</span>
          </p>
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
      </div>
    </main>
  );
}
