import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  image: string | null;
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

  const url = `https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json([] as NewsResponseItem[]);
    }

    const data = (await response.json()) as FinnhubNewsItem[];
    if (!Array.isArray(data)) {
      return NextResponse.json([] as NewsResponseItem[]);
    }

    const latest = data
      .filter((item) => item.headline && item.url && item.datetime)
      .sort((a, b) => (b.datetime ?? 0) - (a.datetime ?? 0))
      .slice(0, 6)
      .map((item) => ({
        headline: item.headline as string,
        source: item.source || "Unknown",
        url: item.url as string,
        datetime: new Date((item.datetime as number) * 1000).toISOString(),
        image: item.image || null,
      }));

    return NextResponse.json(latest);
  } catch {
    return NextResponse.json([] as NewsResponseItem[]);
  }
}
