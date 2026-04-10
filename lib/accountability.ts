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
  const { weekStart, weekEnd } = getWeekWindow(reference);

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, accountabilityMode: true, displayName: true },
  });

  if (!me?.accountabilityMode) return null;

  const existingPair = await prisma.accountabilityPair.findFirst({
    where: {
      weekStart,
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: { select: { id: true, displayName: true } },
      user2: { select: { id: true, displayName: true } },
    },
  });

  if (existingPair) return existingPair;

  const candidates = await prisma.user.findMany({
    where: {
      accountabilityMode: true,
      id: { not: userId },
    },
    select: { id: true, displayName: true },
  });

  if (candidates.length === 0) return null;

  const alreadyPairedIds = await prisma.accountabilityPair.findMany({
    where: { weekStart },
    select: { user1Id: true, user2Id: true },
  });

  const unavailable = new Set<string>();
  for (const pair of alreadyPairedIds) {
    unavailable.add(pair.user1Id);
    unavailable.add(pair.user2Id);
  }

  const availableCandidate = candidates.find((item) => !unavailable.has(item.id));
  if (!availableCandidate) return null;

  const [user1Id, user2Id] = orderedPair(userId, availableCandidate.id);

  const created = await prisma.accountabilityPair.create({
    data: {
      weekStart,
      weekEnd,
      user1Id,
      user2Id,
    },
    include: {
      user1: { select: { id: true, displayName: true } },
      user2: { select: { id: true, displayName: true } },
    },
  });

  return created;
}

export async function getWeeklySummaryWithPartner(userId: string, reference = new Date()) {
  const { weekStart } = getWeekWindow(reference);
  const lastWeekReference = new Date(weekStart);
  lastWeekReference.setDate(lastWeekReference.getDate() - 7);
  const { weekStart: lastWeekStart } = getWeekWindow(lastWeekReference);

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountabilityMode: true, displayName: true },
  });

  const mySummary = await ensureWeeklySummary(userId, reference);

  const reviewHistory = await prisma.accountabilityReview.findMany({
    where: { revieweeId: userId },
    include: {
      reviewer: { select: { displayName: true } },
      pair: { select: { weekStart: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const lastWeekFeedback = await prisma.accountabilityReview.findFirst({
    where: {
      revieweeId: userId,
      pair: { weekStart: lastWeekStart },
    },
    include: {
      reviewer: { select: { displayName: true } },
      pair: { select: { weekStart: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!me?.accountabilityMode) {
    return {
      weekStart,
      accountabilityMode: false,
      mySummary,
      partner: null,
      partnerSummary: null,
      pendingReview: false,
      receivedReview: null,
      lastWeekFeedback,
      reviewHistory,
    };
  }

  const pair = await ensureWeeklyPairForUser(userId, reference);

  if (!pair) {
    return {
      weekStart,
      accountabilityMode: true,
      mySummary,
      partner: null,
      partnerSummary: null,
      pendingReview: false,
      receivedReview: null,
      lastWeekFeedback,
      reviewHistory,
    };
  }

  const partnerId = pair.user1Id === userId ? pair.user2Id : pair.user1Id;
  const partnerSummary = await ensureWeeklySummary(partnerId, reference);
  const existingReview = await prisma.accountabilityReview.findUnique({
    where: {
      pairId_reviewerId: {
        pairId: pair.id,
        reviewerId: userId,
      },
    },
  });

  const receivedReview = await prisma.accountabilityReview.findUnique({
    where: {
      pairId_reviewerId: {
        pairId: pair.id,
        reviewerId: partnerId,
      },
    },
  });

  return {
    weekStart,
    accountabilityMode: true,
    mySummary,
    partner: pair.user1Id === userId ? pair.user2 : pair.user1,
    partnerSummary,
    pair,
    pendingReview: !existingReview,
    receivedReview,
    lastWeekFeedback,
    reviewHistory,
  };
}
