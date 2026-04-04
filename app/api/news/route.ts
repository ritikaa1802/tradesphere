import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHoldings } from "@/lib/portfolio";

interface FinnhubNewsItem {
  headline?: string;
  source?: string;
  url?: string;
  datetime?: number;
  image?: string;
}

interface NewsResponseItem {
  headline: string;
  source: string;
  url: string;
  datetime: string;
  symbol: string;
  image: string | null;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json([] as NewsResponseItem[]);
  }

  const holdings = await getHoldings(session.user.id);
  const symbols = Array.from(new Set(holdings.map((holding) => holding.stock).filter(Boolean)));

  if (symbols.length === 0) {
    return NextResponse.json([] as NewsResponseItem[]);
  }

  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 7);

  const fromDate = toDateString(from);
  const toDate = toDateString(today);

  const newsBySymbol = await Promise.all(
    symbols.map(async (symbol) => {
      const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${fromDate}&to=${toDate}&token=${encodeURIComponent(apiKey)}`;

      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          return [] as NewsResponseItem[];
        }

        const data = (await response.json()) as FinnhubNewsItem[];
        if (!Array.isArray(data)) {
          return [] as NewsResponseItem[];
        }

        return data
          .filter((item) => item.headline && item.url && item.datetime)
          .map((item) => ({
            headline: item.headline as string,
            source: item.source || "Unknown",
            url: item.url as string,
            datetime: new Date((item.datetime as number) * 1000).toISOString(),
            symbol,
            image: item.image || null,
          }));
      } catch {
        return [] as NewsResponseItem[];
      }
    }),
  );

  const merged = newsBySymbol
    .flat()
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
    .slice(0, 6);

  return NextResponse.json(merged);
}
