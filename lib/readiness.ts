import prisma from "@/lib/prisma";

export type ReadinessTier = "Just Starting 🌱" | "Building Discipline 💪" | "Almost Ready ⚡" | "Ready to Go Live 🚀";

function getReadinessTier(score: number): ReadinessTier {
  if (score <= 30) return "Just Starting 🌱";
  if (score <= 60) return "Building Discipline 💪";
  if (score <= 85) return "Almost Ready ⚡";
  return "Ready to Go Live 🚀";
}

function normalizeEmotion(value: string | null): string {
  return (value || "").trim().toLowerCase();
}

export async function calculateReadinessScore(userId: string) {
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      emotionalState: true,
      followedPlan: true,
      pnl: true,
      status: true,
    },
  });

  let score = 50;

  for (const trade of trades) {
    const followedPlan = (trade.followedPlan || "").trim().toLowerCase();
    const emotion = normalizeEmotion(trade.emotionalState);
    const pnl = trade.pnl ?? 0;

    if (followedPlan === "yes") score += 5;
    if (followedPlan === "no") score -= 3;

    if (emotion === "calm" || emotion === "confident") score += 3;
    if (emotion === "impulsive") score -= 5;

    if (pnl > 0) score += 2;

    const badEmotion = emotion === "anxious" || emotion === "impulsive";
    if (pnl < 0 && badEmotion) {
      score -= 2;
    }
  }

  const normalized = Math.max(0, Math.min(100, score));
  return {
    score: normalized,
    tier: getReadinessTier(normalized),
    sampleSize: trades.length,
  };
}
