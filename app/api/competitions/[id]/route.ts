import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPortfolioSummary } from "@/lib/portfolio";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const competition = await prisma.competition.findFirst({
    where: { id: params.id },
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
    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  }

  const rows = await Promise.all(
    competition.entries.map(async (entry) => {
      const summary = await getPortfolioSummary(entry.user.id);
      const holdingsValue = summary.holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
      const currentValue = summary.balance + holdingsValue;
      const gainPercent = ((currentValue - 100000) / 100000) * 100;
      const totalTrades = await prisma.trade.count({ where: { userId: entry.user.id } });

      return {
        userId: entry.user.id,
        displayName: entry.user.displayName || `Trader-${entry.user.id.slice(0, 6)}`,
        gainPercent,
        totalTrades,
        isPro: entry.user.isPro,
      };
    }),
  );

  const ranked = rows
    .sort((a, b) => b.gainPercent - a.gainPercent)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

  const now = Date.now();
  const status =
    new Date(competition.startDate).getTime() > now
      ? "upcoming"
      : new Date(competition.endDate).getTime() < now || !competition.isActive
        ? "ended"
        : "live";

  return NextResponse.json({
    contest: {
      id: competition.id,
      title: competition.title,
      description: competition.description,
      prizeDescription: competition.prizeDescription,
      startDate: competition.startDate,
      endDate: competition.endDate,
      isActive: competition.isActive,
      status,
      participants: competition.entries.length,
    },
    leaderboard: ranked,
    isJoined: competition.entries.some((entry) => entry.userId === session.user.id),
    yourRank: ranked.find((entry) => entry.userId === session.user.id)?.rank ?? null,
  });
}
