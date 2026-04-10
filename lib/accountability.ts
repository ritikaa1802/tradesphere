import prisma from "@/lib/prisma";
import { computeWeeklyBehaviorMetrics, getWeekWindow } from "@/lib/communityMetrics";

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

export async function getCurrentAcceptedPairForUser(userId: string, reference = new Date()) {
  const { weekStart, weekEnd } = getWeekWindow(reference);

  const existingPair = await prisma.accountabilityPair.findFirst({
    where: {
      weekStart,
      weekEnd,
      status: "accepted",
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: { select: { id: true, displayName: true } },
      user2: { select: { id: true, displayName: true } },
    },
  });

  return existingPair;
}

export async function getPendingOutgoingRequestForUser(userId: string, reference = new Date()) {
  const { weekStart, weekEnd } = getWeekWindow(reference);

  const pending = await prisma.accountabilityPair.findFirst({
    where: {
      requesterId: userId,
      status: "pending",
      weekStart,
      weekEnd,
    },
    include: {
      user1: { select: { id: true, displayName: true } },
      user2: { select: { id: true, displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!pending) return null;

  const recipient = pending.user1Id === userId ? pending.user2 : pending.user1;

  return {
    id: pending.id,
    recipient: {
      id: recipient.id,
      displayName: recipient.displayName,
    },
  };
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
      outgoingRequest: null,
      lastWeekFeedback,
      reviewHistory,
    };
  }

  const pair = await getCurrentAcceptedPairForUser(userId, reference);

  if (!pair) {
    const outgoingRequest = await getPendingOutgoingRequestForUser(userId, reference);

    return {
      weekStart,
      accountabilityMode: true,
      mySummary,
      partner: null,
      partnerSummary: null,
      pendingReview: false,
      receivedReview: null,
      outgoingRequest,
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
    outgoingRequest: null,
    lastWeekFeedback,
    reviewHistory,
  };
}
