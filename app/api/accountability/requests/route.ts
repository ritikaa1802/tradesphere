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

  const incomingRequests = await prisma.accountabilityPair.findMany({
    where: {
      status: "pending",
      weekStart,
      weekEnd,
      requesterId: {
        not: userId,
      },
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: {
          id: true,
          displayName: true,
          tradingStyle: true,
          traderType: true,
        },
      },
      user2: {
        select: {
          id: true,
          displayName: true,
          tradingStyle: true,
          traderType: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const requesterIds = incomingRequests.map((request) => request.requesterId);

  const summaries = await prisma.weeklySummary.findMany({
    where: {
      weekStart,
      userId: {
        in: requesterIds,
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
        in: requesterIds,
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
    requests: incomingRequests.map((request) => {
      const requester = request.user1.id === request.requesterId ? request.user1 : request.user2;
      return {
        pairId: request.id,
        requester: {
          id: requester.id,
          displayName: requester.displayName,
          tradingStyle: requester.tradingStyle,
          traderType: requester.traderType,
          disciplineScore: summaryMap.get(requester.id) ?? 0,
          totalTradesThisWeek: tradeCountMap.get(requester.id) ?? 0,
        },
      };
    }),
  });
}
