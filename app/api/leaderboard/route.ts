import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPortfolioSummary } from "@/lib/portfolio";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  gainPercent: number;
  totalTrades: number;
  isPro: boolean;
}

function getWeeklyResetDays(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday = (8 - day) % 7;
  return daysUntilMonday === 0 ? 7 : daysUntilMonday;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { showOnLeaderboard: true },
    select: {
      id: true,
      displayName: true,
      isPro: true,
      createdAt: true,
      trades: {
        select: { id: true },
      },
      portfolio: {
        select: { balance: true },
      },
    },
  });

  const scored = await Promise.all(
    users.map(async (user) => {
      if (!user.portfolio) {
        return null;
      }

      const summary = await getPortfolioSummary(user.id);
      const holdingsValue = summary.holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
      const currentValue = summary.balance + holdingsValue;
      const gainPercent = ((currentValue - 100000) / 100000) * 100;

      return {
        userId: user.id,
        displayName: user.displayName || `Trader-${user.id.slice(0, 6)}`,
        gainPercent,
        totalTrades: user.trades.length,
        isPro: user.isPro,
      };
    }),
  );

  const ranked = scored
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.gainPercent - a.gainPercent)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const top20: LeaderboardEntry[] = ranked.slice(0, 20).map((item) => ({
    rank: item.rank,
    displayName: item.displayName,
    gainPercent: item.gainPercent,
    totalTrades: item.totalTrades,
    isPro: item.isPro,
  }));

  const currentUserRank = ranked.find((entry) => entry.userId === session.user.id)?.rank ?? null;

  return NextResponse.json({
    entries: top20,
    yourRank: currentUserRank,
    weeklyResetInDays: getWeeklyResetDays(),
  });
}
