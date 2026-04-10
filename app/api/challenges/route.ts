import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureDefaultChallenges, endOfMonth } from "@/lib/challenges";

function currentMonthYear() {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1).padStart(2, "0"),
    year: String(now.getFullYear()),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDefaultChallenges();

  const userId = session.user.id;
  const { month, year } = currentMonthYear();

  const [challenges, currentChampion, pastChampions] = await Promise.all([
    prisma.cohortChallenge.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        entries: {
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
        },
      },
    }),
    prisma.monthlyChampion.findUnique({
      where: { month_year: { month, year } },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
    }),
    prisma.monthlyChampion.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
    }),
  ]);

  const myWinners = new Set<string>();

  const challengePayload = challenges.map((challenge) => {
    const rankedEntries = challenge.entries
      .sort((a, b) => b.disciplineScore - a.disciplineScore || a.joinedAt.getTime() - b.joinedAt.getTime())
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    const myEntry = rankedEntries.find((entry) => entry.userId === userId) || null;
    const topEntry = rankedEntries[0];
    if (topEntry && topEntry.userId === userId) {
      myWinners.add(challenge.id);
    }

    const top10 = rankedEntries.slice(0, 10).map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      rank: entry.rank,
      displayName: entry.user.displayName || `Trader-${entry.userId.slice(0, 6)}`,
      disciplineScore: Number(entry.disciplineScore.toFixed(2)),
      totalTrades: entry.totalTrades,
      ruleBreaks: entry.ruleBreaks,
      checklistCompletion: Number(entry.checklistCompletion.toFixed(2)),
      isPro: entry.user.isPro,
    }));

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      isActive: challenge.isActive,
      maxParticipants: challenge.maxParticipants,
      isPro: challenge.isPro,
      participantCount: challenge.entries.length,
      myEntry: myEntry
        ? {
            id: myEntry.id,
            rank: myEntry.rank,
            disciplineScore: Number(myEntry.disciplineScore.toFixed(2)),
            totalTrades: myEntry.totalTrades,
            ruleBreaks: myEntry.ruleBreaks,
            checklistCompletion: Number(myEntry.checklistCompletion.toFixed(2)),
          }
        : null,
      top10,
    };
  });

  const now = new Date();
  const newChallengeAvailable = challengePayload.some(
    (challenge) => challenge.isActive && challenge.participantCount < challenge.maxParticipants && !challenge.myEntry
  );

  const championJustDeclared = Boolean(
    currentChampion && now.getTime() - currentChampion.createdAt.getTime() <= 24 * 60 * 60 * 1000
  );

  return NextResponse.json({
    challenges: challengePayload,
    monthlyChampion: currentChampion
      ? {
          id: currentChampion.id,
          month: currentChampion.month,
          year: currentChampion.year,
          disciplineScore: Number(currentChampion.disciplineScore.toFixed(2)),
          displayName: currentChampion.user.displayName || currentChampion.user.email,
          badge: "👑",
          proUnlockedUntil: currentChampion.proUnlockedUntil,
          createdAt: currentChampion.createdAt,
        }
      : null,
    pastChampions: pastChampions.map((champion) => ({
      id: champion.id,
      month: champion.month,
      year: champion.year,
      disciplineScore: Number(champion.disciplineScore.toFixed(2)),
      displayName: champion.user.displayName || champion.user.email,
      badge: "👑",
    })),
    myBadges: {
      sevenDayChampion: challengePayload.some(
        (challenge) => !challenge.isPro && challenge.myEntry?.rank === 1
      ),
      thirtyDayChampion: challengePayload.some(
        (challenge) => challenge.isPro && challenge.myEntry?.rank === 1
      ),
      monthlyChampion: Boolean(currentChampion?.userId === userId),
    },
    monthlyCountdown: endOfMonth(),
    hasNewChallengeNotification: newChallengeAvailable || championJustDeclared,
  });
}
