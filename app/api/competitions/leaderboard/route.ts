import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPortfolioSummary } from "@/lib/portfolio";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const competition = await prisma.competition.findFirst({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    include: {
      entries: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              isPro: true,
            },
          },
        },
      },
    },
  });

  if (!competition) {
    return NextResponse.json({ entries: [], yourRank: null });
  }

  const entries = await Promise.all(
    competition.entries.map(async (entry: (typeof competition.entries)[number]) => {
      const summary = await getPortfolioSummary(entry.user.id);
      const holdingsValue = summary.holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
      const currentValue = summary.balance + holdingsValue;
      const gainPercent = ((currentValue - 100000) / 100000) * 100;
      const tradeCount = await prisma.trade.count({ where: { userId: entry.user.id } });

      return {
        userId: entry.user.id,
        displayName: entry.user.displayName || `Trader-${entry.user.id.slice(0, 6)}`,
        gainPercent,
        totalTrades: tradeCount,
        isPro: entry.user.isPro,
      };
    }),
  );

  const ranked = entries
    .sort((a: (typeof entries)[number], b: (typeof entries)[number]) => b.gainPercent - a.gainPercent)
    .map((entry: (typeof entries)[number], index: number) => ({
      rank: index + 1,
      ...entry,
    }));

  return NextResponse.json({
    entries: ranked,
    yourRank: ranked.find((entry: (typeof ranked)[number]) => entry.userId === session.user.id)?.rank || null,
    competition: {
      id: competition.id,
      title: competition.title,
      description: competition.description,
      startDate: competition.startDate,
      endDate: competition.endDate,
      prizeDescription: competition.prizeDescription,
    },
  });
}
