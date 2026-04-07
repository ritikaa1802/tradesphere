import { NextRequest, NextResponse } from "next/server";

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

const VIEW_CONFIG: Record<string, { interval: string; range: string }> = {
  "1D": { interval: "5m", range: "1d" },
  "1W": { interval: "15m", range: "5d" },
  "1M": { interval: "60m", range: "1mo" },
};

function parseSymbol(raw: string): string {
  return raw.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
}

export async function GET(request: NextRequest) {
  const symbolParam = request.nextUrl.searchParams.get("symbol") || "";
  const viewParam = (request.nextUrl.searchParams.get("view") || "1D").toUpperCase();

  const symbol = parseSymbol(symbolParam);
  const config = VIEW_CONFIG[viewParam] || VIEW_CONFIG["1D"];

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}.NS?interval=${config.interval}&range=${config.range}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ candles: [] });
    }

    const data = (await response.json()) as YahooChartResponse;
    const result = data.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const quote = result?.indicators?.quote?.[0];

    const opens = quote?.open || [];
    const highs = quote?.high || [];
    const lows = quote?.low || [];
    const closes = quote?.close || [];

    const candles = timestamps
      .map((time, index) => ({
        time,
        open: opens[index],
        high: highs[index],
        low: lows[index],
        close: closes[index],
      }))
      .filter(
        (item): item is { time: number; open: number; high: number; low: number; close: number } =>
          typeof item.open === "number" &&
          typeof item.high === "number" &&
          typeof item.low === "number" &&
          typeof item.close === "number",
      );

    return NextResponse.json({ candles });
  } catch {
    return NextResponse.json({ candles: [] });
  }
}
