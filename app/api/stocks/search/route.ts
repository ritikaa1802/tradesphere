import { NextRequest, NextResponse } from "next/server";
import { searchTopStocks } from "@/lib/stockApi";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const stocks = searchTopStocks(query, 10);

  return NextResponse.json({ stocks });
}
