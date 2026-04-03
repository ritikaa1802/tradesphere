import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPortfolioSummary } from "@/lib/portfolio";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getPortfolioSummary(session.user.id);
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}