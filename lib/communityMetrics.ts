import prisma from "@/lib/prisma";

export type WeeklyBehaviorMetrics = {
  weekStart: Date;
  weekEnd: Date;
  tradeCount: number;
  winRate: number;
  ruleBreaks: number;
  emotionDistribution: Record<string, number>;
  avgRiskPerTrade: number;
  checklistCompletionRate: number;
  disciplineScore: number;
};

export function getWeekWindow(reference = new Date()) {
  const date = new Date(reference);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

export function calculateDisciplineScore(input: {
  tradeCount: number;
  overtradeDays: number;
  ruleBreaks: number;
  checklistCompletionRate: number;
  avgRiskPerTrade: number;
}): number {
  let score = 50;

  score += Math.round(input.checklistCompletionRate * 30);
  score -= input.ruleBreaks * 4;
  score -= input.overtradeDays * 5;

  if (input.tradeCount <= 3) score += 4;
  if (input.avgRiskPerTrade <= 1.5) score += 6;
  if (input.avgRiskPerTrade > 3) score -= 8;

  return Math.max(0, Math.min(100, score));
}

export async function computeWeeklyBehaviorMetrics(userId: string, reference = new Date()): Promise<WeeklyBehaviorMetrics> {
  const { weekStart, weekEnd } = getWeekWindow(reference);

  const trades = await prisma.trade.findMany({
    where: {
      userId,
      createdAt: { gte: weekStart, lte: weekEnd },
      status: { in: ["executed", "triggered", "pending"] },
    },
    select: {
      pnl: true,
      emotionalState: true,
      followedPlan: true,
      createdAt: true,
      price: true,
      quantity: true,
      orderType: true,
      note: true,
    },
  });

  const tradeCount = trades.length;
  const resolvedTrades = trades.filter((trade) => trade.pnl !== null);
  const winningTrades = resolvedTrades.filter((trade) => (trade.pnl ?? 0) > 0).length;
  const winRate = resolvedTrades.length > 0 ? (winningTrades / resolvedTrades.length) * 100 : 0;

  const emotionDistribution: Record<string, number> = {};
  for (const trade of trades) {
    const emotion = (trade.emotionalState || "unspecified").trim().toLowerCase();
    emotionDistribution[emotion] = (emotionDistribution[emotion] || 0) + 1;
  }

  const checklistCompletions = trades.filter((trade) => (trade.followedPlan || "").trim().toLowerCase() === "yes").length;
  const checklistCompletionRate = tradeCount > 0 ? checklistCompletions / tradeCount : 0;

  const totalRiskPercent = trades.reduce((sum, trade) => {
    const tradeValue = Math.max(1, trade.price * trade.quantity);
    const estimatedRisk = trade.orderType.toLowerCase().includes("stop") ? 1 : 3;
    return sum + estimatedRisk / tradeValue * 10000;
  }, 0);
  const avgRiskPerTrade = tradeCount > 0 ? totalRiskPercent / tradeCount : 0;

  const dayBuckets = new Map<string, number>();
  for (const trade of trades) {
    const key = trade.createdAt.toISOString().slice(0, 10);
    dayBuckets.set(key, (dayBuckets.get(key) || 0) + 1);
  }
  const overtradeDays = Array.from(dayBuckets.values()).filter((count) => count > 5).length;

  const ruleBreaks = trades.reduce((count, trade) => {
    const followedPlan = (trade.followedPlan || "").trim().toLowerCase();
    const impulsive = (trade.emotionalState || "").trim().toLowerCase() === "impulsive";
    if (followedPlan === "no" || impulsive) return count + 1;
    return count;
  }, 0);

  const disciplineScore = calculateDisciplineScore({
    tradeCount,
    overtradeDays,
    ruleBreaks,
    checklistCompletionRate,
    avgRiskPerTrade,
  });

  return {
    weekStart,
    weekEnd,
    tradeCount,
    winRate,
    ruleBreaks,
    emotionDistribution,
    avgRiskPerTrade,
    checklistCompletionRate,
    disciplineScore,
  };
}
