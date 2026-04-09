import prisma from "@/lib/prisma";
import { computeWeeklyBehaviorMetrics, getWeekWindow } from "@/lib/communityMetrics";

function orderedPair(a: string, b: string) {
  return a < b ? [a, b] : [b, a];
}

export async function ensureWeeklySummary(userId: string, reference = new Date()) {
  const metrics = await computeWeeklyBehaviorMetrics(userId, reference);

  const summary = await prisma.weeklySummary.upsert({
    where: {
      userId_weekStart: {
        userId,
        weekStart: metrics.weekStart,
      },
    },
    update: {
      weekEnd: metrics.weekEnd,
      tradeCount: metrics.tradeCount,
      winRate: metrics.winRate,
      ruleBreaks: metrics.ruleBreaks,
      emotionDistribution: metrics.emotionDistribution,
      avgRiskPerTrade: metrics.avgRiskPerTrade,
      checklistCompletionRate: metrics.checklistCompletionRate,
      disciplineScore: metrics.disciplineScore,
    },
    create: {
      userId,
      weekStart: metrics.weekStart,
      weekEnd: metrics.weekEnd,
      tradeCount: metrics.tradeCount,
      winRate: metrics.winRate,
      ruleBreaks: metrics.ruleBreaks,
      emotionDistribution: metrics.emotionDistribution,
      avgRiskPerTrade: metrics.avgRiskPerTrade,
      checklistCompletionRate: metrics.checklistCompletionRate,
      disciplineScore: metrics.disciplineScore,
    },
  });

  return summary;
}

export async function ensureWeeklyPairForUser(userId: string, reference = new Date()) {
  const { weekStart } = getWeekWindow(reference);

  const existingPair = await prisma.accountabilityPair.findFirst({
    where: {
      weekStart,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: { select: { id: true, displayName: true, email: true } },
      userB: { select: { id: true, displayName: true, email: true } },
    },
  });

  if (existingPair) return existingPair;

  const settings = await prisma.accountabilitySettings.findMany({
    where: { enabled: true, userId: { not: userId } },
    select: { userId: true },
  });

  if (settings.length === 0) return null;

  const alreadyPairedIds = await prisma.accountabilityPair.findMany({
    where: { weekStart },
    select: { userAId: true, userBId: true },
  });
  const unavailable = new Set<string>();
  for (const pair of alreadyPairedIds) {
    unavailable.add(pair.userAId);
    unavailable.add(pair.userBId);
  }

  const availableCandidate = settings.find((item) => !unavailable.has(item.userId));
  if (!availableCandidate) return null;

  const [userAId, userBId] = orderedPair(userId, availableCandidate.userId);

  const created = await prisma.accountabilityPair.create({
    data: {
      weekStart,
      userAId,
      userBId,
      status: "active",
    },
    include: {
      userA: { select: { id: true, displayName: true, email: true } },
      userB: { select: { id: true, displayName: true, email: true } },
    },
  });

  return created;
}

export async function getWeeklySummaryWithPartner(userId: string, reference = new Date()) {
  const { weekStart } = getWeekWindow(reference);

  const mySummary = await ensureWeeklySummary(userId, reference);
  const pair = await ensureWeeklyPairForUser(userId, reference);

  if (!pair) {
    return {
      weekStart,
      mySummary,
      partner: null,
      partnerSummary: null,
      pendingReview: false,
    };
  }

  const partnerId = pair.userAId === userId ? pair.userBId : pair.userAId;
  const partnerSummary = await ensureWeeklySummary(partnerId, reference);
  const existingReview = await prisma.partnerReview.findUnique({
    where: {
      pairId_reviewerId: {
        pairId: pair.id,
        reviewerId: userId,
      },
    },
  });

  return {
    weekStart,
    mySummary,
    partner: pair.userAId === userId ? pair.userB : pair.userA,
    partnerSummary,
    pair,
    pendingReview: !existingReview,
  };
}
