import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Mood frequency
  const moodCount: Record<string, number> = {};
  const moodPnl: Record<string, { total: number; count: number }> = {};
  const moodPerDay: Record<string, string> = {};

  trades.forEach((trade) => {
    if (trade.mood) {
      // Frequency
      moodCount[trade.mood] = (moodCount[trade.mood] || 0) + 1;

      // P&L per mood (only for sells)
      if (trade.type === "sell" && trade.pnl !== null) {
        if (!moodPnl[trade.mood]) {
          moodPnl[trade.mood] = { total: 0, count: 0 };
        }
        moodPnl[trade.mood].total += trade.pnl;
        moodPnl[trade.mood].count += 1;
      }

      // Mood per day (latest mood for the day)
      const date = new Date(trade.createdAt).toISOString().split("T")[0];
      moodPerDay[date] = trade.mood;
    }
  });

  // Average P&L per mood
  const avgPnlPerMood: Record<string, number> = {};
  Object.keys(moodPnl).forEach((mood) => {
    avgPnlPerMood[mood] = moodPnl[mood].count > 0 ? moodPnl[mood].total / moodPnl[mood].count : 0;
  });

  return NextResponse.json({
    moodFrequency: moodCount,
    avgPnlPerMood,
    moodPerDay,
  });
}