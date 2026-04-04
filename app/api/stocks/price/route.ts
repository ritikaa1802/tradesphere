import { NextRequest, NextResponse } from "next/server";
import { fetchStockQuote } from "@/lib/stockApi";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") || "";

  if (!symbol.trim()) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const quote = await fetchStockQuote(symbol);
  if (!quote) {
    return NextResponse.json({ error: "Price not found" }, { status: 404 });
  }

  return NextResponse.json({ symbol, price: quote.price, changePercent: quote.changePercent });
}
