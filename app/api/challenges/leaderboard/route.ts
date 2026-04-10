import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureDefaultChallenges } from "@/lib/challenges";

function currentMonthYear() {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1).padStart(2, "0"),
    year: String(now.getFullYear()),
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDefaultChallenges();

  const { searchParams } = new URL(request.url);
  const challengeId = String(searchParams.get("challengeId") || "").trim();

  const challenge = challengeId
    ? await prisma.cohortChallenge.findUnique({ where: { id: challengeId } })
    : await prisma.cohortChallenge.findFirst({ orderBy: { createdAt: "asc" } });

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const { month, year } = currentMonthYear();
  const monthlyChampion = await prisma.monthlyChampion.findUnique({
    where: { month_year: { month, year } },
    select: { userId: true },
  });

  const entries = await prisma.cohortEntry.findMany({
    where: { challengeId: challenge.id },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          isPro: true,
        },
      },
    },
    orderBy: [{ disciplineScore: "desc" }, { joinedAt: "asc" }],
  });

  const ranked = entries.map((entry, index) => ({
    id: entry.id,
    rank: index + 1,
    userId: entry.userId,
    displayName: entry.user.displayName || `Trader-${entry.userId.slice(0, 6)}`,
    disciplineScore: Number(entry.disciplineScore.toFixed(2)),
    totalTrades: entry.totalTrades,
    ruleBreaks: entry.ruleBreaks,
    checklistCompletion: Number(entry.checklistCompletion.toFixed(2)),
    isPro: entry.user.isPro,
    isCurrentUser: entry.userId === session.user.id,
    isMonthlyChampion: monthlyChampion?.userId === entry.userId,
  }));

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      title: challenge.title,
      isPro: challenge.isPro,
    },
    entries: ranked,
    yourRank: ranked.find((entry) => entry.userId === session.user.id)?.rank || null,
  });
}
