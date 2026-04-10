import prisma from "@/lib/prisma";

type TradeScoreInput = {
  userId: string;
  followedPlan?: string | null;
  emotionalState?: string | null;
  tradeReason?: string | null;
  checklistCompleted?: boolean;
};

function monthYear(reference = new Date()) {
  const month = String(reference.getMonth() + 1).padStart(2, "0");
  const year = String(reference.getFullYear());
  return { month, year };
}

export function endOfMonth(reference = new Date()) {
  const date = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999);
  return date;
}

function scoreDelta(input: TradeScoreInput) {
  const followedPlan = String(input.followedPlan || "").trim().toLowerCase() === "yes";
  const emotionalState = String(input.emotionalState || "").trim().toLowerCase();
  const tradeReason = String(input.tradeReason || "").trim().toLowerCase();
  const checklistCompleted = input.checklistCompleted ?? followedPlan;

  let delta = 0;
  let ruleBreak = false;

  if (followedPlan) {
    delta += 10;
  } else {
    delta -= 10;
    ruleBreak = true;
  }

  if (emotionalState.includes("calm") || emotionalState.includes("confident")) {
    delta += 5;
  }

  if (checklistCompleted) {
    delta += 3;
  }

  if (emotionalState.includes("impulsive")) {
    delta -= 5;
    ruleBreak = true;
  }

  if (tradeReason.includes("revenge")) {
    delta -= 3;
    ruleBreak = true;
  }

  return { delta, ruleBreak, checklistCompleted };
}

export async function ensureDefaultChallenges(reference = new Date()) {
  const now = new Date(reference);
  const dayMs = 24 * 60 * 60 * 1000;

  const templates = [
    {
      title: "7-Day Beginner Challenge",
      description: "Perfect for new traders. Build discipline in 7 days.",
      startDate: now,
      endDate: new Date(now.getTime() + 7 * dayMs),
      isPro: false,
      maxParticipants: 100,
    },
    {
      title: "30-Day Discipline Championship",
      description: "The ultimate test of trading discipline. Pro traders only.",
      startDate: now,
      endDate: new Date(now.getTime() + 30 * dayMs),
      isPro: true,
      maxParticipants: 50,
    },
  ] as const;

  await Promise.all(
    templates.map(async (template) => {
      const existing = await prisma.cohortChallenge.findFirst({
        where: {
          title: template.title,
          isPro: template.isPro,
        },
      });

      if (existing) {
        if (!existing.isActive && existing.endDate > now) {
          await prisma.cohortChallenge.update({
            where: { id: existing.id },
            data: { isActive: true },
          });
        }
        return;
      }

      await prisma.cohortChallenge.create({
        data: template,
      });
    })
  );
}

export async function recalculateRanks(challengeId: string) {
  const entries = await prisma.cohortEntry.findMany({
    where: { challengeId },
    orderBy: [{ disciplineScore: "desc" }, { joinedAt: "asc" }],
    select: { id: true },
  });

  await Promise.all(
    entries.map((entry, index) =>
      prisma.cohortEntry.update({
        where: { id: entry.id },
        data: { rank: index + 1 },
      })
    )
  );
}

export async function updateChallengeScoresForTrade(input: TradeScoreInput) {
  const now = new Date();
  const { delta, ruleBreak, checklistCompleted } = scoreDelta(input);

  const activeEntries = await prisma.cohortEntry.findMany({
    where: {
      userId: input.userId,
      challenge: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    },
    select: {
      id: true,
      challengeId: true,
      disciplineScore: true,
      totalTrades: true,
      ruleBreaks: true,
      checklistCompletion: true,
    },
  });

  if (activeEntries.length === 0) {
    return { updated: 0 };
  }

  const affectedChallenges = new Set<string>();

  for (const entry of activeEntries) {
    const previousChecklistCount = Math.round((entry.checklistCompletion / 100) * entry.totalTrades);
    const nextTotalTrades = entry.totalTrades + 1;
    const nextChecklistCount = previousChecklistCount + (checklistCompleted ? 1 : 0);
    const nextChecklistCompletion = nextTotalTrades > 0 ? (nextChecklistCount / nextTotalTrades) * 100 : 0;

    await prisma.cohortEntry.update({
      where: { id: entry.id },
      data: {
        disciplineScore: Math.max(0, entry.disciplineScore + delta),
        totalTrades: nextTotalTrades,
        ruleBreaks: entry.ruleBreaks + (ruleBreak ? 1 : 0),
        checklistCompletion: Number(nextChecklistCompletion.toFixed(2)),
      },
    });

    affectedChallenges.add(entry.challengeId);
  }

  await Promise.all(Array.from(affectedChallenges).map((challengeId) => recalculateRanks(challengeId)));

  return { updated: activeEntries.length };
}

export async function declareMonthlyChampion(reference = new Date()) {
  const { month, year } = monthYear(reference);

  const existing = await prisma.monthlyChampion.findUnique({
    where: {
      month_year: {
        month,
        year,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
  });

  if (existing) {
    return existing;
  }

  const start = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0, 0);
  const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

  const entries = await prisma.cohortEntry.findMany({
    where: {
      challenge: {
        startDate: { lte: end },
        endDate: { gte: start },
      },
    },
    select: {
      userId: true,
      disciplineScore: true,
    },
  });

  if (entries.length === 0) {
    return null;
  }

  const scores = new Map<string, number>();
  for (const entry of entries) {
    scores.set(entry.userId, (scores.get(entry.userId) || 0) + entry.disciplineScore);
  }

  let winnerUserId = "";
  let winnerScore = -Infinity;
  for (const [userId, score] of Array.from(scores.entries())) {
    if (score > winnerScore) {
      winnerUserId = userId;
      winnerScore = score;
    }
  }

  if (!winnerUserId) {
    return null;
  }

  const proUnlockedUntil = new Date(reference.getTime() + 30 * 24 * 60 * 60 * 1000);

  const champion = await prisma.monthlyChampion.create({
    data: {
      userId: winnerUserId,
      month,
      year,
      disciplineScore: Number(winnerScore.toFixed(2)),
      proUnlockedUntil,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: winnerUserId },
    data: {
      isPro: true,
      proUnlockedUntil,
      proGrantedByChallenge: true,
    },
  });

  return champion;
}

export async function syncExpiredChallengePro(userId: string, reference = new Date()) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isPro: true,
      proUnlockedUntil: true,
      proGrantedByChallenge: true,
    },
  });

  if (!user) return false;

  if (
    user.isPro &&
    user.proGrantedByChallenge &&
    user.proUnlockedUntil &&
    user.proUnlockedUntil.getTime() < reference.getTime()
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPro: false,
        proGrantedByChallenge: false,
      },
    });
    return true;
  }

  return false;
}

export function getChampionBadge(champion: { displayName: string; score: number }) {
  return {
    label: "Monthly Champion",
    icon: "👑",
    displayName: champion.displayName,
    score: champion.score,
  };
}
