import { NextRequest, NextResponse } from "next/server";
import { fetchStockPrice } from "@/lib/stockApi";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") || "";

  if (!symbol.trim()) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const price = await fetchStockPrice(symbol);
  if (price === null) {
    return NextResponse.json({ error: "Price not found" }, { status: 404 });
  }

  return NextResponse.json({ symbol, price });
}
