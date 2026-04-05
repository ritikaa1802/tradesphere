export interface StockSearchItem {
  symbol: string;
  name: string;
}

const SECTOR_MAP: Record<string, string> = {
  TCS: "IT",
  INFY: "IT",
  WIPRO: "IT",
  HCLTECH: "IT",
  TECHM: "IT",
  HDFCBANK: "Banking",
  HDFC: "Banking",
  ICICIBANK: "Banking",
  SBIN: "Banking",
  AXISBANK: "Banking",
  KOTAKBANK: "Banking",
  MARUTI: "Auto",
  TATAMOTORS: "Auto",
  HEROMOTOCO: "Auto",
  SUNPHARMA: "Pharma",
  DRREDDY: "Pharma",
  CIPLA: "Pharma",
  ONGC: "Energy",
  BPCL: "Energy",
  IOC: "Energy",
  COALINDIA: "Energy",
};

export const TOP_NSE_STOCKS: StockSearchItem[] = [
  { symbol: "RELIANCE", name: "Reliance Industries" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "INFY", name: "Infosys" },
  { symbol: "HDFC", name: "HDFC Bank" },
  { symbol: "ICICIBANK", name: "ICICI Bank" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "WIPRO", name: "Wipro" },
  { symbol: "HCLTECH", name: "HCL Technologies" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance" },
  { symbol: "MARUTI", name: "Maruti Suzuki" },
  { symbol: "TATAMOTORS", name: "Tata Motors" },
  { symbol: "ADANIENT", name: "Adani Enterprises" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
  { symbol: "ASIANPAINT", name: "Asian Paints" },
  { symbol: "AXISBANK", name: "Axis Bank" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
  { symbol: "LT", name: "Larsen and Toubro" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical" },
  { symbol: "TITAN", name: "Titan Company" },
  { symbol: "NESTLEIND", name: "Nestle India" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement" },
  { symbol: "POWERGRID", name: "Power Grid Corporation" },
  { symbol: "NTPC", name: "NTPC" },
  { symbol: "ONGC", name: "Oil and Natural Gas Corporation" },
  { symbol: "COALINDIA", name: "Coal India" },
  { symbol: "TECHM", name: "Tech Mahindra" },
  { symbol: "HDFCLIFE", name: "HDFC Life" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories" },
  { symbol: "CIPLA", name: "Cipla" },
  { symbol: "EICHERMOT", name: "Eicher Motors" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp" },
  { symbol: "BPCL", name: "Bharat Petroleum" },
  { symbol: "IOC", name: "Indian Oil Corporation" },
  { symbol: "GRASIM", name: "Grasim Industries" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank" },
  { symbol: "BRITANNIA", name: "Britannia Industries" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals" },
  { symbol: "TATACONSUM", name: "Tata Consumer Products" },
  { symbol: "HINDALCO", name: "Hindalco Industries" },
  { symbol: "JSWSTEEL", name: "JSW Steel" },
  { symbol: "TATASTEEL", name: "Tata Steel" },
  { symbol: "VEDL", name: "Vedanta" },
  { symbol: "SAIL", name: "Steel Authority of India" },
  { symbol: "IRCTC", name: "Indian Railway Catering and Tourism" },
  { symbol: "DMART", name: "Avenue Supermarts" },
  { symbol: "NYKAA", name: "FSN E-Commerce Ventures" },
  { symbol: "ZOMATO", name: "Zomato" },
  { symbol: "PAYTM", name: "One97 Communications" },
];

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\.(NS|BO)$/i, "");
}

export function getSectorForSymbol(symbol: string): string {
  const normalized = normalizeSymbol(symbol);
  return SECTOR_MAP[normalized] || "Others";
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
      };
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
}

function parseYahooPrice(data: unknown): number | null {
  const parsed = data as YahooChartResponse;
  const price = parsed.chart?.result?.[0];

  const marketPrice = price?.meta?.regularMarketPrice;
  if (typeof marketPrice === "number" && Number.isFinite(marketPrice)) {
    return marketPrice;
  }

  const closes = price?.indicators?.quote?.[0]?.close;
  if (!Array.isArray(closes)) {
    return null;
  }

  for (let i = closes.length - 1; i >= 0; i -= 1) {
    const close = closes[i];
    if (typeof close === "number" && Number.isFinite(close)) {
      return close;
    }
  }

  return null;
}

async function fetchYahooPrice(symbolWithExchange: string): Promise<number | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbolWithExchange}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as unknown;
    return parseYahooPrice(data);
  } catch {
    return null;
  }
}

export async function fetchStockPrice(symbol: string): Promise<number | null> {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    return null;
  }

  const nsePrice = await fetchYahooPrice(`${normalized}.NS`);
  if (nsePrice !== null) {
    return nsePrice;
  }

  return fetchYahooPrice(`${normalized}.BO`);
}

export async function fetchStockQuote(symbol: string): Promise<{ price: number; changePercent: number } | null> {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) {
    return null;
  }

  async function fetchQuote(symbolWithExchange: string): Promise<{ price: number; changePercent: number } | null> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbolWithExchange}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const parsed = (await response.json()) as YahooChartResponse;
      const result = parsed.chart?.result?.[0];
      const price = parseYahooPrice(parsed);

      if (typeof price !== "number" || !Number.isFinite(price)) {
        return null;
      }

      const prev = result?.meta?.previousClose ?? result?.meta?.chartPreviousClose;
      const changePercent = typeof prev === "number" && prev > 0
        ? ((price - prev) / prev) * 100
        : 0;

      return { price, changePercent };
    } catch {
      return null;
    }
  }

  const nseQuote = await fetchQuote(`${normalized}.NS`);
  if (nseQuote) {
    return nseQuote;
  }

  return fetchQuote(`${normalized}.BO`);
}

export function searchTopStocks(query: string, limit = 10): StockSearchItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return TOP_NSE_STOCKS.slice(0, limit);
  }

  return TOP_NSE_STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(trimmed) ||
      stock.name.toLowerCase().includes(trimmed),
  ).slice(0, limit);
}
