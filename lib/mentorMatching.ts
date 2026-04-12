import prisma from "@/lib/prisma";
import { ensureWeeklySummary } from "@/lib/accountability";

export const EXPERIENCE_LEVELS = ["Intermediate", "Advanced"] as const;
export const TRADING_STYLES = ["Intraday", "Swing", "Long-term"] as const;

export type MentorEligibility = {
  tradeCount: number;
  disciplineScore: number;
  canRegister: boolean;
  missing: string[];
};

export async function getMentorEligibility(userId: string): Promise<MentorEligibility> {
  const [tradeCount, weeklySummary] = await Promise.all([
    prisma.trade.count({ where: { userId } }),
    ensureWeeklySummary(userId),
  ]);

  const disciplineScore = weeklySummary.disciplineScore;
  const missing: string[] = [];

  if (tradeCount < 20) {
    missing.push(`You need 20 trades (you have ${tradeCount})`);
  }

  if (disciplineScore <= 60) {
    missing.push(`You need discipline score 60+ (you have ${disciplineScore})`);
  }

  return {
    tradeCount,
    disciplineScore,
    canRegister: missing.length === 0,
    missing,
  };
}

export async function getUserStats(userId: string) {
  const [weeklySummary, totalTrades, completedTrades, winningTrades] = await Promise.all([
    ensureWeeklySummary(userId),
    prisma.trade.count({ where: { userId } }),
    prisma.trade.count({ where: { userId, pnl: { not: null } } }),
    prisma.trade.count({ where: { userId, pnl: { gt: 0 } } }),
  ]);

  const winRate = completedTrades > 0 ? (winningTrades / completedTrades) * 100 : 0;

  return {
    disciplineScore: weeklySummary.disciplineScore,
    winRate,
    totalTrades,
  };
}

export async function getRecentTradeCount(userId: string, days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.trade.count({
    where: {
      userId,
      createdAt: { gte: since },
    },
  });
}

export async function getMentorCurrentMenteesCount(mentorId: string) {
  return prisma.mentorship.count({
    where: {
      mentorId,
      status: "active",
    },
  });
}

export async function hasActiveOrPendingMenteeRequest(menteeId: string) {
  const existing = await prisma.mentorship.findFirst({
    where: {
      menteeId,
      status: { in: ["pending", "active"] },
    },
    select: { id: true },
  });

  return Boolean(existing);
}
