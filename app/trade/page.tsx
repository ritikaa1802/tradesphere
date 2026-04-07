"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Side = "buy" | "sell";
type OrderType = "market" | "limit" | "stoploss";
type Timeframe = "1D" | "1W" | "1M";
type OrderMode = "intraday" | "overnight";
type QuantityMode = "fixed" | "auto";
type OrderPanelTab = "active" | "pending" | "history";

interface StockOption {
  symbol: string;
  name: string;
}

interface WatchlistItem {
  symbol: string;
  exchange: "NSE" | "BSE";
  price: number | null;
  changePercent: number | null;
  basePrice: number | null;
  loading: boolean;
}

interface HoldingItem {
  stock: string;
  quantity: number;
  avgBuyPrice: number;
  invested: number;
  currentPrice: number;
  pnl: number;
}

interface PortfolioPayload {
  holdings: HoldingItem[];
}

interface PendingOrder {
  id: string;
  stock: string;
  type: string;
  orderType: string;
  status: string;
  targetPrice: number | null;
  price: number;
  quantity: number;
  currentPrice: number | null;
  createdAt: string;
}

interface PendingOrdersPayload {
  orders: PendingOrder[];
}

interface TradeHistoryItem {
  id: string;
  stock: string;
  type: string;
  price: number;
  quantity: number;
  pnl: number | null;
  orderType: string;
  status: string;
  createdAt: string;
}

const DEFAULT_WATCHLIST: Array<{ symbol: string; exchange: "NSE" | "BSE" }> = [
  { symbol: "RELIANCE", exchange: "NSE" },
  { symbol: "TCS", exchange: "NSE" },
  { symbol: "INFY", exchange: "NSE" },
  { symbol: "HDFCBANK", exchange: "NSE" },
  { symbol: "ICICIBANK", exchange: "NSE" },
  { symbol: "SBIN", exchange: "NSE" },
  { symbol: "AXISBANK", exchange: "NSE" },
  { symbol: "TATAMOTORS", exchange: "NSE" },
  { symbol: "MARUTI", exchange: "NSE" },
  { symbol: "HCLTECH", exchange: "NSE" },
  { symbol: "WIPRO", exchange: "NSE" },
  { symbol: "SUNPHARMA", exchange: "NSE" },
  { symbol: "LT", exchange: "NSE" },
  { symbol: "BAJFINANCE", exchange: "NSE" },
  { symbol: "ADANIENT", exchange: "NSE" },
  { symbol: "KOTAKBANK", exchange: "NSE" },
];

const AVAILABLE_BALANCE = 250000;

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function AnimatedPrice({ value }: { value: number | null }) {
  const [display, setDisplay] = useState(value ?? 0);
  const previousRef = useRef(value ?? 0);

  useEffect(() => {
    if (value === null) return;

    const from = previousRef.current;
    const to = value;
    const start = performance.now();
    const duration = 220;
    let frame = 0;

    const run = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(run);
      else previousRef.current = to;
    };

    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  if (value === null) return <>--</>;
  return <>{display.toFixed(2)}</>;
}

async function fetchQuote(symbol: string): Promise<{ price: number; changePercent: number } | null> {
  try {
    const response = await fetch(`/api/stocks/price?symbol=${encodeURIComponent(symbol)}`);
    const data = (await response.json()) as { price?: number; changePercent?: number };
    if (!response.ok || typeof data.price !== "number") return null;

    return {
      price: data.price,
      changePercent: typeof data.changePercent === "number" ? data.changePercent : 0,
    };
  } catch {
    return null;
  }
}

export default function TradePage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(
    DEFAULT_WATCHLIST.map((item) => ({
      ...item,
      price: null,
      changePercent: null,
      basePrice: null,
      loading: true,
    })),
  );

  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");

  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [orderMode, setOrderMode] = useState<OrderMode>("overnight");
  const [quantityMode, setQuantityMode] = useState<QuantityMode>("fixed");
  const [limitMode, setLimitMode] = useState<"auto" | "manual">("auto");
  const [setTarget, setSetTarget] = useState(false);
  const [setStopLoss, setSetStopLoss] = useState(false);
  const [targetValue, setTargetValue] = useState("");
  const [stopLossValue, setStopLossValue] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [priceInput, setPriceInput] = useState("");

  const [stockQuery, setStockQuery] = useState("");
  const [stockSuggestions, setStockSuggestions] = useState<StockOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [panelTab, setPanelTab] = useState<OrderPanelTab>("active");
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [recentTrades, setRecentTrades] = useState<TradeHistoryItem[]>([]);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  function pushHistory(symbol: string, value: number) {
    setPriceHistory((prev) => {
      const current = prev[symbol] ?? [];
      return { ...prev, [symbol]: [...current, value].slice(-180) };
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const symbolParam = params.get("symbol");
    const sideParam = params.get("side");
    const normalized = symbolParam?.trim().toUpperCase();
    if (!normalized) return;

    if (sideParam === "buy" || sideParam === "sell") {
      setSide(sideParam);
    }

    setSelectedSymbol(normalized);
    setWatchlist((prev) => {
      if (prev.some((item) => item.symbol === normalized)) return prev;
      return [{ symbol: normalized, exchange: "NSE" as const, price: null, changePercent: null, basePrice: null, loading: true }, ...prev].slice(0, 20);
    });
  }, []);

  useEffect(() => {
    const idx = watchlist.findIndex((item) => item.symbol === selectedSymbol);
    if (idx >= 0 && idx !== selectedIndex) setSelectedIndex(idx);
  }, [watchlist, selectedSymbol, selectedIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      if (watchlist.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => {
          const next = Math.min(watchlist.length - 1, prev + 1);
          setSelectedSymbol(watchlist[next].symbol);
          return next;
        });
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => {
          const next = Math.max(0, prev - 1);
          setSelectedSymbol(watchlist[next].symbol);
          return next;
        });
      }

      if (event.key === "Enter") {
        const selected = watchlist[selectedIndex];
        if (!selected) return;
        event.preventDefault();
        setToast(`Selected ${selected.symbol}`);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [watchlist, selectedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchContainerRef.current) return;
      if (!searchContainerRef.current.contains(event.target as Node)) setShowSuggestions(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = (await response.json()) as { stocks?: StockOption[] };
        setStockSuggestions(data.stocks || []);
        setShowSuggestions(true);
      } catch {
        setStockSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [stockQuery]);

  useEffect(() => {
    let cancelled = false;

    const refreshWatchlist = async () => {
      const symbols = watchlist.map((item) => item.symbol);
      const quotes = await Promise.all(symbols.map((symbol) => fetchQuote(symbol)));
      if (cancelled) return;

      setWatchlist((prev) =>
        prev.map((item, index) => {
          const quote = quotes[index];
          if (!quote) return { ...item, loading: false };
          pushHistory(item.symbol, quote.price);

          return {
            ...item,
            price: quote.price,
            changePercent: quote.changePercent,
            basePrice: item.basePrice ?? quote.price,
            loading: false,
          };
        }),
      );
    };

    refreshWatchlist();
    const intervalId = setInterval(refreshWatchlist, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [watchlist.length]);

  useEffect(() => {
    const tick = setInterval(() => {
      setWatchlist((prev) =>
        prev.map((item) => {
          if (item.price === null || item.basePrice === null) return item;

          const volatility = Math.max(item.price * 0.0007, 0.03);
          const delta = (Math.random() - 0.5) * 2 * volatility;
          const nextPrice = Math.max(0.05, item.price + delta);
          if (Math.abs(delta) < 0.0001) return item;

          pushHistory(item.symbol, nextPrice);
          const changePercent = ((nextPrice - item.basePrice) / item.basePrice) * 100;

          return { ...item, price: nextPrice, changePercent };
        }),
      );
    }, 1200);

    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPanelData() {
      try {
        const [portfolioRes, pendingRes, tradesRes] = await Promise.all([
          fetch("/api/portfolio", { cache: "no-store" }),
          fetch("/api/orders/pending", { cache: "no-store" }),
          fetch("/api/trades", { cache: "no-store" }),
        ]);

        if (cancelled) return;

        if (portfolioRes.ok) {
          const portfolioData = (await portfolioRes.json()) as PortfolioPayload;
          setHoldings(portfolioData.holdings || []);
        }

        if (pendingRes.ok) {
          const pendingData = (await pendingRes.json()) as PendingOrdersPayload;
          setPendingOrders(pendingData.orders || []);
        }

        if (tradesRes.ok) {
          const tradesData = (await tradesRes.json()) as TradeHistoryItem[];
          setRecentTrades(tradesData.slice(0, 10));
        }
      } catch {
        // Keep terminal responsive even if panel data endpoints fail.
      }
    }

    loadPanelData();
    const intervalId = setInterval(loadPanelData, 20000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 1500);
    return () => clearTimeout(id);
  }, [toast]);

  const selectedItem = useMemo(
    () => watchlist.find((item) => item.symbol === selectedSymbol) ?? null,
    [watchlist, selectedSymbol],
  );

  const selectedPrice = (selectedItem?.price ?? Number(priceInput)) || 0;
  const selectedChange = selectedItem?.changePercent ?? 0;
  const selectedPositive = selectedChange >= 0;

  useEffect(() => {
    if (!selectedItem?.price) return;
    if (!priceInput || orderType === "market") setPriceInput(selectedItem.price.toFixed(2));
  }, [selectedItem?.price, orderType, priceInput]);

  function selectSuggestion(option: StockOption) {
    const symbol = option.symbol.trim().toUpperCase();
    if (!symbol) return;

    setSelectedSymbol(symbol);
    setStockQuery("");
    setShowSuggestions(false);

    setWatchlist((prev) => {
      const exists = prev.some((item) => item.symbol === symbol);
      if (exists) return prev;
      return [{ symbol, exchange: "NSE" as const, price: null, changePercent: null, basePrice: null, loading: true }, ...prev].slice(0, 20);
    });
  }

  const manualQuantityNumber = Math.max(0, Number(quantity) || 0);
  const autoCalculatedQty = selectedPrice > 0 ? Math.max(1, Math.floor((AVAILABLE_BALANCE * 0.25) / selectedPrice)) : 0;
  const quantityNumber = quantityMode === "auto" ? autoCalculatedQty : manualQuantityNumber;

  const autoLimitPrice = selectedPrice > 0
    ? selectedPrice + (side === "buy" ? selectedPrice * 0.001 : -selectedPrice * 0.001)
    : 0;
  const manualOrStopPrice = Number(priceInput) || 0;
  const effectivePrice = orderType === "market"
    ? selectedPrice
    : orderType === "limit" && limitMode === "auto"
      ? autoLimitPrice
      : manualOrStopPrice;

  const tradeValue = effectivePrice * quantityNumber;
  const charges = tradeValue > 0 ? 20 + tradeValue * 0.0008 : 0;
  const finalAmount = side === "buy" ? tradeValue + charges : tradeValue - charges;
  const requiredMargin = side === "buy" ? finalAmount : tradeValue * 0.2;
  const insufficientFunds = requiredMargin > AVAILABLE_BALANCE;

  const orderContextNote = [
    `Mode:${orderMode}`,
    `QtyMode:${quantityMode}`,
    setTarget && targetValue ? `Target:${targetValue}` : "",
    setStopLoss && stopLossValue ? `StopLoss:${stopLossValue}` : "",
  ].filter(Boolean).join(" | ");

  const positionsRows = useMemo(() => {
    return holdings.map((holding) => {
      const watch = watchlist.find((item) => item.symbol === holding.stock);
      const ltp = typeof watch?.price === "number" ? watch.price : holding.currentPrice;
      const pnl = (ltp - holding.avgBuyPrice) * holding.quantity;
      return {
        ...holding,
        ltp,
        pnl,
      };
    });
  }, [holdings, watchlist]);

  const chartSeries = useMemo(() => {
    const raw = priceHistory[selectedSymbol] ?? [];
    const count = timeframe === "1D" ? 30 : timeframe === "1W" ? 90 : 180;
    const sliced = raw.slice(-count);
    return sliced.map((price, idx) => ({
      t: idx,
      price,
    }));
  }, [priceHistory, selectedSymbol, timeframe]);

  const orderBook = useMemo(() => {
    const base = selectedPrice || 100;
    const bucket = Math.max(0.05, base * 0.0006);

    const sells = Array.from({ length: 4 }, (_, i) => ({
      price: base + bucket * (i + 1),
      qty: 40 + ((selectedSymbol.charCodeAt(0) + i * 17) % 180),
    }));

    const buys = Array.from({ length: 4 }, (_, i) => ({
      price: Math.max(0.05, base - bucket * (i + 1)),
      qty: 45 + ((selectedSymbol.charCodeAt(1) + i * 21) % 180),
    }));

    return { sells, buys };
  }, [selectedPrice, selectedSymbol]);

  function bumpQuantity(by: number) {
    const next = Math.max(0, (Number(quantity) || 0) + by);
    setQuantity(String(next));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!selectedSymbol) {
      setLoading(false);
      setMessage("Select a stock first.");
      return;
    }

    if (quantityNumber <= 0 || effectivePrice <= 0) {
      setLoading(false);
      setMessage("Enter valid quantity and price.");
      return;
    }

    if (insufficientFunds) {
      setLoading(false);
      setMessage("Insufficient funds for required margin.");
      return;
    }

    try {
      const response = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: selectedSymbol,
          type: side,
          orderType,
          targetPrice: orderType === "market" ? null : effectivePrice,
          price: effectivePrice,
          quantity: quantityNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "Order failed");
        return;
      }

      setToast(`${side === "buy" ? "Buy" : "Sell"} order placed for ${selectedSymbol}`);
      setMessage(data?.message || "Order placed");
    } catch {
      setMessage("Order failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050912] px-2 py-2 text-slate-100 sm:px-3 lg:px-4">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-1 text-[11px] text-slate-400">
          <span>Execution Terminal</span>
          <span className="font-medium text-emerald-300">Live Feed</span>
        </div>

        <div className="grid grid-cols-1 gap-2 xl:grid-cols-[250px_minmax(0,1fr)_390px]">
          <section className="border border-slate-800 bg-[#0b1220]">
            <div className="border-b border-slate-800 px-2 py-1.5">
              <div className="relative" ref={searchContainerRef}>
                <input
                  value={stockQuery}
                  onChange={(event) => setStockQuery(event.target.value)}
                  onFocus={() => {
                    if (stockSuggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="Search"
                  className="h-7 w-full border border-slate-700 bg-[#090f1b] px-2 text-[11px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500"
                />

                {showSuggestions && (
                  <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto border border-slate-700 bg-[#090f1b] shadow-lg">
                    {isSearching ? (
                      <p className="px-2 py-2 text-xs text-slate-400">Searching...</p>
                    ) : stockSuggestions.length === 0 ? (
                      <p className="px-2 py-2 text-xs text-slate-400">No results</p>
                    ) : (
                      stockSuggestions.map((option) => (
                        <button
                          key={option.symbol}
                          type="button"
                          onClick={() => selectSuggestion(option)}
                          className="flex w-full items-center justify-between border-b border-slate-800 px-2 py-2 text-left text-xs text-slate-200 hover:bg-slate-800/60"
                        >
                          <span className="truncate">{option.name}</span>
                          <span className="ml-2 font-semibold text-blue-300">{option.symbol}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              {watchlist.map((item, index) => {
                const isSelected = item.symbol === selectedSymbol;
                const hasChange = item.changePercent !== null;
                const change = item.changePercent ?? 0;
                const up = change >= 0;

                return (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => {
                      setSelectedSymbol(item.symbol);
                      setSelectedIndex(index);
                    }}
                    onMouseEnter={() => {
                      setSelectedSymbol(item.symbol);
                      setSelectedIndex(index);
                    }}
                    className={`grid w-full grid-cols-[1fr_auto] items-center border-b border-slate-800 px-2 py-1.5 text-left transition ${
                      isSelected ? "bg-blue-500/15" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-slate-100">{item.symbol}</p>
                      <p className="text-[10px] text-slate-500">{item.exchange}</p>
                    </div>
                    <div className="text-right tabular-nums">
                      <p className="text-xs font-semibold text-slate-100">₹<AnimatedPrice value={item.price} /></p>
                      <p className={`text-[10px] ${up ? "text-emerald-400" : "text-rose-400"}`}>
                        {item.loading && !hasChange ? "--" : `${up ? "+" : ""}${change.toFixed(2)}%`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="border border-slate-800 bg-[#0b1220]">
            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-slate-100">{selectedSymbol}</p>
                <p className={`text-xs tabular-nums ${selectedPositive ? "text-emerald-400" : "text-rose-400"}`}>
                  ₹<AnimatedPrice value={selectedItem?.price ?? null} /> ({selectedPositive ? "+" : ""}{selectedChange.toFixed(2)}%)
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(["1D", "1W", "1M"] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`h-7 px-2 text-[11px] ${timeframe === tf ? "bg-blue-600 text-white" : "border border-slate-700 text-slate-300 hover:bg-slate-800"}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[430px] w-full px-2 py-2">
              <ResponsiveContainer>
                <AreaChart
                  data={chartSeries}
                  margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  onClick={(state: any) => {
                    const payload = state?.activePayload?.[0]?.value;
                    if (typeof payload === "number" && Number.isFinite(payload)) {
                      setPriceInput(payload.toFixed(2));
                      if (orderType === "market") setOrderType("limit");
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="tradeChartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={selectedPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={selectedPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a2744" strokeDasharray="2 2" />
                  <XAxis dataKey="t" stroke="#9ca3af" tick={{ fontSize: 10 }} tickFormatter={() => ""} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} width={46} tickFormatter={(v) => `₹${Number(v).toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0d1117", border: "1px solid #1a2744", color: "#fff" }}
                    formatter={(value) => {
                      const n = Number(Array.isArray(value) ? value[0] : value) || 0;
                      return [`₹${n.toFixed(2)}`, "Price"];
                    }}
                  />
                  <Area type="monotone" dataKey="price" stroke={selectedPositive ? "#22c55e" : "#ef4444"} strokeWidth={1.8} fill="url(#tradeChartFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <aside className="border border-slate-800 bg-[#0b1220] lg:sticky lg:top-2 lg:h-[calc(100vh-16px)]">
            <form onSubmit={onSubmit} className="flex h-full flex-col">
              <div className="border-b border-slate-800 px-3 py-2">
                <div className="mb-1 flex items-end justify-between">
                  <p className="text-base font-bold tracking-wide text-slate-100">{selectedSymbol || "--"}</p>
                  <div className="text-right tabular-nums">
                    <p className="text-sm font-semibold text-slate-100">₹<AnimatedPrice value={selectedItem?.price ?? null} /></p>
                    <p className={`text-[11px] font-medium ${selectedPositive ? "text-emerald-400" : "text-rose-400"}`}>{`${selectedPositive ? "+" : ""}${selectedChange.toFixed(2)}%`}</p>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-800 px-3 py-2 text-[11px]">
                <p className="mb-1 font-semibold text-slate-300">Order Book</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold text-rose-300">SELL</p>
                    {orderBook.sells.map((row, idx) => (
                      <div key={`sell-${idx}`} className="grid grid-cols-2 py-0.5 tabular-nums text-[10px]">
                        <span className="text-rose-300">{row.price.toFixed(2)}</span>
                        <span className="text-right text-slate-300">{row.qty}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold text-emerald-300">BUY</p>
                    {orderBook.buys.map((row, idx) => (
                      <div key={`buy-${idx}`} className="grid grid-cols-2 py-0.5 tabular-nums text-[10px]">
                        <span className="text-emerald-300">{row.price.toFixed(2)}</span>
                        <span className="text-right text-slate-300">{row.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-3 py-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSide("buy")}
                    className={`h-8 text-xs font-bold transition ${side === "buy" ? "bg-emerald-600 text-white" : "border border-emerald-700/60 bg-emerald-900/15 text-emerald-300"}`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide("sell")}
                    className={`h-8 text-xs font-bold transition ${side === "sell" ? "bg-rose-600 text-white" : "border border-rose-700/60 bg-rose-900/15 text-rose-300"}`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-800 px-3 py-2">
                <div className="grid grid-cols-3 gap-1.5">
                  {([ ["market", "MKT"], ["limit", "LMT"], ["stoploss", "SL"] ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setOrderType(value)}
                      className={`h-7 text-[11px] font-semibold transition ${orderType === value ? "bg-blue-600 text-white" : "border border-slate-700 bg-[#090f1b] text-slate-300 hover:bg-slate-800"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 px-3 py-2">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <label>
                    <span className="mb-1 block text-[10px] text-slate-500">Qty</span>
                    <input
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      type="number"
                      min={1}
                      className="h-8 w-full border border-slate-700 bg-[#090f1b] px-2 text-xs text-slate-100 outline-none focus:border-blue-500"
                    />
                  </label>
                  <div>
                    <span className="mb-1 block text-[10px] text-slate-500">Quick</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 5, 10].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => bumpQuantity(step)}
                          className="h-8 border border-slate-700 bg-[#090f1b] px-2 text-[10px] font-semibold text-slate-200 hover:bg-slate-800"
                        >
                          +{step}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {orderType !== "market" && (
                  <div className="mt-2">
                    <span className="mb-1 block text-[10px] text-slate-500">Price</span>
                    <input
                      value={priceInput}
                      onChange={(event) => setPriceInput(event.target.value)}
                      type="number"
                      step="0.01"
                      className="h-8 w-full border border-slate-700 bg-[#090f1b] px-2 text-xs text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 px-3 py-2 text-[11px] text-slate-300 tabular-nums">
                <div className="mb-1 flex items-center justify-between">
                  <span>Balance</span>
                  <span className="font-semibold text-slate-100">{formatINR(AVAILABLE_BALANCE)}</span>
                </div>
                <div className="mb-1 flex items-center justify-between">
                  <span>Total</span>
                  <span className="font-semibold text-slate-100">{formatINR(tradeValue)}</span>
                </div>
                <div className="mb-1 flex items-center justify-between">
                  <span>Margin</span>
                  <span className={`font-semibold ${insufficientFunds ? "text-rose-300" : "text-slate-100"}`}>{formatINR(requiredMargin)}</span>
                </div>
                <div className="mb-1 flex items-center justify-between">
                  <span>Charges</span>
                  <span className="font-semibold text-slate-100">{formatINR(charges)}</span>
                </div>
                {insufficientFunds && <p className="mt-1 text-[10px] font-medium text-rose-300">Insufficient funds for this order size.</p>}
              </div>

              <div className="mt-auto border-t border-slate-800 px-3 py-3">
                {message && <p className="mb-2 text-[11px] text-amber-300">{message}</p>}
                <button
                  type="submit"
                  disabled={loading || insufficientFunds}
                  className={`h-10 w-full text-sm font-bold tracking-wide text-white transition active:scale-[0.99] ${side === "buy" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {loading ? "Submitting..." : `${side === "buy" ? "Buy" : "Sell"} ${selectedSymbol || "STOCK"}`}
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>

      {toast && <div className="fixed bottom-4 right-4 border border-emerald-700 bg-emerald-900/85 px-3 py-2 text-xs text-emerald-100">{toast}</div>}
    </main>
  );
}
