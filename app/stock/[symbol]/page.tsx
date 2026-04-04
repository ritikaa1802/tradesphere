import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHoldings } from "@/lib/portfolio";
import { fetchStockPrice } from "@/lib/stockApi";
import StockChartClient from "./StockChartClient";

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
  };
}

function parseSymbol(raw: string): string {
  return raw.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
}

const INTERVAL_OPTIONS = {
  "1D": { interval: "5m", range: "1d" },
  "5D": { interval: "15m", range: "5d" },
  "1M": { interval: "60m", range: "1mo" },
  "3M": { interval: "1d", range: "3mo" },
} as const;

export default async function StockDetailPage({
  params,
  searchParams,
}: {
  params: { symbol: string };
  searchParams?: { view?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#ef4444]">
        Unauthorized. Please <Link href="/login" className="text-[#3b82f6] hover:underline">login</Link>.
      </section>
    );
  }

  const symbol = parseSymbol(params.symbol || "");
  if (!symbol) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#ef4444]">Invalid stock symbol.</section>;
  }

  const selectedView = searchParams?.view && searchParams.view in INTERVAL_OPTIONS
    ? (searchParams.view as keyof typeof INTERVAL_OPTIONS)
    : "5D";
  const selectedConfig = INTERVAL_OPTIONS[selectedView];

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=${selectedConfig.interval}&range=${selectedConfig.range}`;
  let candles: Array<{ time: number; open: number; high: number; low: number; close: number }> = [];
  let volumes: Array<{ time: number; value: number; color: string }> = [];

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as YahooChartResponse;
      const result = data.chart?.result?.[0];
      const timestamps = result?.timestamp || [];
      const quote = result?.indicators?.quote?.[0];
      const opens = quote?.open || [];
      const highs = quote?.high || [];
      const lows = quote?.low || [];
      const closes = quote?.close || [];
      const vols = quote?.volume || [];

      candles = timestamps
        .map((time, index) => ({
          time,
          open: opens[index],
          high: highs[index],
          low: lows[index],
          close: closes[index],
          volume: vols[index],
        }))
        .filter(
          (item): item is { time: number; open: number; high: number; low: number; close: number; volume: number | null } =>
            typeof item.open === "number" &&
            typeof item.high === "number" &&
            typeof item.low === "number" &&
            typeof item.close === "number",
        )
        .map((item) => ({
          time: item.time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

      volumes = timestamps
        .map((time, index) => ({
          time,
          value: vols[index],
          open: opens[index],
          close: closes[index],
        }))
        .filter((item): item is { time: number; value: number; open: number | null; close: number | null } => typeof item.value === "number")
        .map((item) => ({
          time: item.time,
          value: item.value,
          color: typeof item.open === "number" && typeof item.close === "number" && item.close >= item.open ? "#22c55e55" : "#ef444455",
        }));
    }
  } catch {
    candles = [];
    volumes = [];
  }

  const holdings = await getHoldings(session.user.id);
  const holding = holdings.find((item) => item.stock.toUpperCase() === symbol);
  const livePrice = await fetchStockPrice(symbol);
  const currentPrice = livePrice ?? candles[candles.length - 1]?.close ?? 0;
  const previousClose = candles.length > 1 ? candles[candles.length - 2].close : currentPrice;
  const changePercent = previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0;

  const quantityOwned = holding?.quantity ?? 0;
  const avgBuyPrice = holding?.avgBuyPrice ?? 0;
  const holdingPnl = quantityOwned > 0 ? (currentPrice - avgBuyPrice) * quantityOwned : 0;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{symbol}</h2>
            <p className="mt-1 text-sm text-[#9ca3af]">Live stock terminal view ({selectedView} / {selectedConfig.interval})</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">₹{currentPrice.toFixed(2)}</p>
            <p className={`text-sm font-semibold ${changePercent >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[#1a2744] bg-[#0f1929] p-3">
            <p className="text-xs text-[#9ca3af]">Qty Owned</p>
            <p className="mt-1 text-lg font-bold text-white">{quantityOwned}</p>
          </div>
          <div className="rounded-lg border border-[#1a2744] bg-[#0f1929] p-3">
            <p className="text-xs text-[#9ca3af]">Avg Buy Price</p>
            <p className="mt-1 text-lg font-bold text-white">₹{avgBuyPrice.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-[#1a2744] bg-[#0f1929] p-3">
            <p className="text-xs text-[#9ca3af]">Your P&amp;L</p>
            <p className={`mt-1 text-lg font-bold ${holdingPnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              ₹{holdingPnl.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {(Object.keys(INTERVAL_OPTIONS) as Array<keyof typeof INTERVAL_OPTIONS>).map((view) => (
            <Link
              key={view}
              href={`/stock/${encodeURIComponent(symbol)}?view=${view}`}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                view === selectedView
                  ? "bg-[#1d4ed8] text-white"
                  : "bg-[#0f1929] text-[#9ca3af] hover:text-white"
              }`}
            >
              {view}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Link href="/trade" className="rounded-lg bg-[#14532d] px-4 py-2 text-sm font-semibold text-[#22c55e] hover:brightness-110">
            Buy
          </Link>
          <Link href="/trade" className="rounded-lg bg-[#7f1d1d] px-4 py-2 text-sm font-semibold text-[#ef4444] hover:brightness-110">
            Sell
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4">
        {candles.length > 0 ? (
          <StockChartClient candles={candles} volumes={volumes} entryPrice={avgBuyPrice > 0 ? avgBuyPrice : null} />
        ) : (
          <p className="text-sm text-[#9ca3af]">Chart data unavailable for this symbol right now.</p>
        )}
      </div>
    </section>
  );
}
