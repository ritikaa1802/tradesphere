import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getWeekWindow } from "@/lib/communityMetrics";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { weekStart, weekEnd } = getWeekWindow(new Date());

  const acceptedPairs = await prisma.accountabilityPair.findMany({
    where: {
      weekStart,
      weekEnd,
      status: "accepted",
    },
    select: {
      user1Id: true,
      user2Id: true,
    },
  });

  const pairedIds = new Set<string>();
  for (const pair of acceptedPairs) {
    pairedIds.add(pair.user1Id);
    pairedIds.add(pair.user2Id);
  }

  const candidates = await prisma.user.findMany({
    where: {
      accountabilityMode: true,
      id: {
        not: userId,
      },
    },
    select: {
      id: true,
      displayName: true,
      tradingStyle: true,
      traderType: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const available = candidates.filter((candidate) => !pairedIds.has(candidate.id));

  const summaries = await prisma.weeklySummary.findMany({
    where: {
      weekStart,
      userId: {
        in: available.map((candidate) => candidate.id),
      },
    },
    select: {
      userId: true,
      disciplineScore: true,
    },
  });
  const summaryMap = new Map(summaries.map((summary) => [summary.userId, summary.disciplineScore]));

  const tradeCounts = await prisma.trade.groupBy({
    by: ["userId"],
    where: {
      userId: {
        in: available.map((candidate) => candidate.id),
      },
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
      status: {
        in: ["executed", "triggered", "pending"],
      },
    },
    _count: {
      _all: true,
    },
  });

  const tradeCountMap = new Map(tradeCounts.map((count) => [count.userId, count._count._all]));

  return NextResponse.json({
    users: available.map((candidate) => ({
      id: candidate.id,
      displayName: candidate.displayName,
      tradingStyle: candidate.tradingStyle,
      traderType: candidate.traderType,
      disciplineScore: summaryMap.get(candidate.id) ?? 0,
      totalTradesThisWeek: tradeCountMap.get(candidate.id) ?? 0,
    })),
  });
}
