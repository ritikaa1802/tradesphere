import prisma from "@/lib/prisma";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

type InsightSeverity = "warning" | "danger" | "success" | "info";

type LossBreakdownType = "revenge" | "fomo" | "overtrading";

interface InsightBase {
  type: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  amount?: number;
}

interface LossBreakdownItem {
  type: LossBreakdownType;
  reason: string;
  amount: number;
  percent: number;
}

export interface Insight extends InsightBase {
  meta?: {
    revengeTradeCount?: number;
    overtradeDays?: number;
    mood?: string;
    percent?: number;
    bestMood?: string;
    bestPercent?: number;
    bestHour?: number;
    worstHour?: number;
    riskScore?: number;
    riskLabel?: string;
    reasons?: string[];
    breakdown?: LossBreakdownItem[];
    streakType?: "win" | "loss" | "none";
    streakCount?: number;
  };
}

type TradeForInsight = {
  id: string;
  type: string;
  orderType: string;
  price: number;
  quantity: number;
  pnl: number | null;
  mood: string | null;
  createdAt: Date;
};

function normalizeMood(mood: string | null): string {
  if (!mood) {
    return "Neutral";
  }

  const map: Record<string, string> = {
    confident: "Confident",
    anxious: "Anxious",
    neutral: "Neutral",
    fomo: "FOMO",
    greedy: "Greedy",
    fearful: "Fearful",
  };

  const key = mood.trim().toLowerCase();
  return map[key] || mood.trim();
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${suffix}`;
}

function percent(part: number, whole: number): number {
  if (whole <= 0) {
    return 0;
  }
  return (part / whole) * 100;
}

function getRevengeStats(trades: TradeForInsight[]) {
  const sortedTrades = [...trades].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  let revengeTradeCount = 0;
  let revengeTradingLosses = 0;

  for (let i = 1; i < sortedTrades.length; i += 1) {
    const prev = sortedTrades[i - 1];
    const current = sortedTrades[i];

    if (prev.pnl !== null && prev.pnl < 0) {
      const diff = current.createdAt.getTime() - prev.createdAt.getTime();
      if (diff > 0 && diff <= FIFTEEN_MINUTES_MS) {
        revengeTradeCount += 1;
        if ((current.pnl ?? 0) < 0) {
          revengeTradingLosses += Math.abs(current.pnl ?? 0);
        }
      }
    }
  }

  return { revengeTradeCount, revengeTradingLosses };
}

function getOvertradingStats(trades: TradeForInsight[]) {
  const tradesByDay: Record<string, TradeForInsight[]> = {};

  for (const trade of trades) {
    const key = toDateKey(trade.createdAt);
    if (!tradesByDay[key]) {
      tradesByDay[key] = [];
    }
    tradesByDay[key].push(trade);
  }

  const overtradeDays = Object.values(tradesByDay).filter((dayTrades) => dayTrades.length > 5);
  const overtradingLosses = overtradeDays.reduce((sum, dayTrades) => {
    return sum + dayTrades.reduce((innerSum, trade) => {
      if ((trade.pnl ?? 0) < 0) {
        return innerSum + Math.abs(trade.pnl ?? 0);
      }
      return innerSum;
    }, 0);
  }, 0);

  return {
    overtradeDaysCount: overtradeDays.length,
    overtradingLosses,
  };
}

function getFomoLosses(trades: TradeForInsight[]) {
  return trades.reduce((sum, trade) => {
    const mood = normalizeMood(trade.mood);
    if (mood === "FOMO" && (trade.pnl ?? 0) < 0) {
      return sum + Math.abs(trade.pnl ?? 0);
    }
    return sum;
  }, 0);
}

function getMoodPerformance(trades: TradeForInsight[]) {
  const moodMap: Record<string, { total: number; count: number }> = {};
  const realized = trades.filter((trade) => trade.pnl !== null);

  for (const trade of realized) {
    const mood = normalizeMood(trade.mood);
    if (!moodMap[mood]) {
      moodMap[mood] = { total: 0, count: 0 };
    }
    moodMap[mood].total += trade.pnl ?? 0;
    moodMap[mood].count += 1;
  }

  const entries = Object.entries(moodMap).map(([mood, value]) => ({
    mood,
    avg: value.count > 0 ? value.total / value.count : 0,
  }));

  if (entries.length === 0) {
    return {
      worstMood: "Neutral",
      bestMood: "Neutral",
      dropPercent: 0,
      betterPercent: 0,
    };
  }

  const worst = entries.reduce((min, current) => (current.avg < min.avg ? current : min), entries[0]);
  const best = entries.reduce((max, current) => (current.avg > max.avg ? current : max), entries[0]);

  const base = Math.max(1, Math.abs(best.avg));
  const dropPercent = ((best.avg - worst.avg) / base) * 100;
  const betterPercent = ((best.avg - worst.avg) / Math.max(1, Math.abs(worst.avg))) * 100;

  return {
    worstMood: worst.mood,
    bestMood: best.mood,
    dropPercent: Number.isFinite(dropPercent) ? Math.max(0, dropPercent) : 0,
    betterPercent: Number.isFinite(betterPercent) ? Math.max(0, betterPercent) : 0,
  };
}

function getTimePerformance(trades: TradeForInsight[]) {
  const byHour: Record<number, number> = {};

  for (const trade of trades) {
    if (trade.pnl === null) {
      continue;
    }
    const hour = trade.createdAt.getHours();
    byHour[hour] = (byHour[hour] || 0) + (trade.pnl ?? 0);
  }

  const hours = Object.entries(byHour).map(([hour, pnl]) => ({ hour: Number(hour), pnl }));

  if (hours.length === 0) {
    return {
      bestHour: 10,
      worstHour: 15,
    };
  }

  const best = hours.reduce((max, current) => (current.pnl > max.pnl ? current : max), hours[0]);
  const worst = hours.reduce((min, current) => (current.pnl < min.pnl ? current : min), hours[0]);

  return {
    bestHour: best.hour,
    worstHour: worst.hour,
  };
}

function getRiskScore(trades: TradeForInsight[]) {
  const { overtradeDaysCount } = getOvertradingStats(trades);
  const stopLossTrades = trades.filter((trade) => trade.orderType.toLowerCase() === "stoploss");
  const avgPositionSize = trades.length > 0
    ? trades.reduce((sum, trade) => sum + (trade.price * trade.quantity), 0) / trades.length
    : 0;

  const moodCounts: Record<string, number> = {};
  for (const trade of trades) {
    const mood = normalizeMood(trade.mood);
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  }

  const topMoodShare = trades.length > 0
    ? Math.max(...Object.values(moodCounts)) / trades.length
    : 0;

  let score = 3;
  const reasons: string[] = [];

  if (overtradeDaysCount > 0) {
    score += overtradeDaysCount >= 3 ? 3 : 2;
    reasons.push(`${overtradeDaysCount} overtrading day(s) with 5+ trades increased risk`);
  } else {
    reasons.push("Trade frequency is controlled on most days");
  }

  if (stopLossTrades.length === 0 && trades.length > 0) {
    score += 2;
    reasons.push("No stop-loss orders found across recent trades");
  } else {
    reasons.push("Stop-loss usage is helping contain downside");
  }

  if (avgPositionSize >= 100000) {
    score += 3;
    reasons.push("Large average position size is amplifying losses");
  } else if (avgPositionSize >= 50000) {
    score += 2;
    reasons.push("Position size is moderately elevated");
  } else {
    reasons.push("Position sizing is relatively disciplined");
  }

  if (topMoodShare >= 0.8) {
    score -= 2;
    reasons.push("Consistent trading mood reduced emotional variance");
  } else if (topMoodShare >= 0.6) {
    score -= 1;
    reasons.push("Mood consistency slightly reduced emotional risk");
  } else {
    reasons.push("Mood swings are adding behavior volatility");
  }

  score = Math.max(1, Math.min(10, score));

  let label = "Moderate Risk Trader";
  if (score <= 3) {
    label = "Low Risk Trader";
  } else if (score >= 7) {
    label = "High Risk Trader";
  }

  return { score, label, reasons: reasons.slice(0, 3) };
}

function getStreakInsight(trades: TradeForInsight[]): Insight {
  const realized = [...trades]
    .filter((trade) => trade.pnl !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (realized.length === 0) {
    return {
      type: "streak",
      title: "Streak",
      description: "No realized streak yet",
      severity: "info",
      meta: { streakType: "none", streakCount: 0 },
    };
  }

  const latest = realized[0].pnl ?? 0;
  if (latest === 0) {
    return {
      type: "streak",
      title: "Streak",
      description: "No active win/loss streak",
      severity: "info",
      meta: { streakType: "none", streakCount: 0 },
    };
  }

  const isWin = latest > 0;
  let count = 0;
  for (const trade of realized) {
    const pnl = trade.pnl ?? 0;
    if ((isWin && pnl > 0) || (!isWin && pnl < 0)) {
      count += 1;
    } else {
      break;
    }
  }

  return {
    type: "streak",
    title: "Streak",
    description: isWin ? `${count} trade win streak` : `${count} trade loss streak`,
    severity: isWin ? "success" : "warning",
    meta: { streakType: isWin ? "win" : "loss", streakCount: count },
  };
}

export async function getDashboardInsights(userId: string): Promise<Insight[]> {
  const trades: TradeForInsight[] = await prisma.trade.findMany({
    where: { userId, status: { in: ["executed", "triggered"] } },
    select: {
      id: true,
      type: true,
      orderType: true,
      price: true,
      quantity: true,
      pnl: true,
      mood: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const insights: Insight[] = [];

  const { revengeTradeCount, revengeTradingLosses } = getRevengeStats(trades);
  if (revengeTradeCount > 0) {
    insights.push({
      type: "revenge-trading",
      title: "Revenge Trading Insight",
      description: `You placed ${revengeTradeCount} revenge trades -> lost \u20b9${revengeTradingLosses.toFixed(2)} from them`,
      severity: revengeTradingLosses > 0 ? "danger" : "warning",
      amount: Number(revengeTradingLosses.toFixed(2)),
      meta: {
        revengeTradeCount,
      },
    });
  }

  const { overtradeDaysCount, overtradingLosses } = getOvertradingStats(trades);
  if (overtradeDaysCount > 0) {
    insights.push({
      type: "overtrading",
      title: "Overtrading Insight",
      description: `You overtrade on bad days -> ${overtradeDaysCount} days with 5+ trades detected`,
      severity: overtradeDaysCount >= 3 ? "danger" : "warning",
      amount: Number(overtradingLosses.toFixed(2)),
      meta: {
        overtradeDays: overtradeDaysCount,
      },
    });
  }

  const mood = getMoodPerformance(trades);
  insights.push({
    type: "mood-worst",
    title: "Mood Insight",
    description: `Your profit drops ${mood.dropPercent.toFixed(1)}% when mood = ${mood.worstMood}`,
    severity: mood.dropPercent >= 30 ? "danger" : "warning",
    meta: {
      mood: mood.worstMood,
      percent: Number(mood.dropPercent.toFixed(1)),
      bestMood: mood.bestMood,
      bestPercent: Number(mood.betterPercent.toFixed(1)),
    },
  });

  insights.push({
    type: "mood-best",
    title: "Mood Insight",
    description: `You perform ${mood.betterPercent.toFixed(1)}% better when ${mood.bestMood}`,
    severity: "success",
    meta: {
      mood: mood.bestMood,
      percent: Number(mood.betterPercent.toFixed(1)),
      bestMood: mood.bestMood,
      bestPercent: Number(mood.betterPercent.toFixed(1)),
    },
  });

  const time = getTimePerformance(trades);
  insights.push({
    type: "time-best",
    title: "Time Insight",
    description: `You perform best at ${formatHour(time.bestHour)}`,
    severity: "success",
    meta: {
      bestHour: time.bestHour,
      worstHour: time.worstHour,
    },
  });

  const avoidAfterHour = time.worstHour >= 12 ? time.worstHour : time.worstHour + 12;
  insights.push({
    type: "time-worst",
    title: "Time Insight",
    description: `Avoid trading after ${formatHour(avoidAfterHour)}`,
    severity: "warning",
    meta: {
      bestHour: time.bestHour,
      worstHour: time.worstHour,
    },
  });

  const fomoLosses = getFomoLosses(trades);
  const totalLosses = trades.reduce((sum, trade) => {
    if ((trade.pnl ?? 0) < 0) {
      return sum + Math.abs(trade.pnl ?? 0);
    }
    return sum;
  }, 0);

  const breakdown: LossBreakdownItem[] = [
    {
      type: "revenge" as const,
      reason: "Revenge trading",
      amount: Number(revengeTradingLosses.toFixed(2)),
      percent: Number(percent(revengeTradingLosses, totalLosses).toFixed(1)),
    },
    {
      type: "fomo" as const,
      reason: "FOMO entry",
      amount: Number(fomoLosses.toFixed(2)),
      percent: Number(percent(fomoLosses, totalLosses).toFixed(1)),
    },
    {
      type: "overtrading" as const,
      reason: "Overtrading",
      amount: Number(overtradingLosses.toFixed(2)),
      percent: Number(percent(overtradingLosses, totalLosses).toFixed(1)),
    },
  ].sort((a, b) => b.amount - a.amount);

  const topBreakdown = breakdown[0];
  insights.push({
    type: "loss-breakdown",
    title: "Loss Breakdown",
    description: `\u20b9${topBreakdown.amount.toFixed(2)} lost due to ${topBreakdown.reason.toLowerCase()} (${topBreakdown.percent.toFixed(1)}% of total losses)`,
    severity: topBreakdown.amount > 0 ? "danger" : "info",
    amount: topBreakdown.amount,
    meta: {
      breakdown,
    },
  });

  const risk = getRiskScore(trades);
  insights.push({
    type: "risk-score",
    title: "Risk Score",
    description: `${risk.label} (${risk.score}/10)`,
    severity: risk.score >= 7 ? "danger" : risk.score >= 4 ? "warning" : "success",
    amount: risk.score,
    meta: {
      riskScore: risk.score,
      riskLabel: risk.label,
      reasons: risk.reasons,
    },
  });

  insights.push(getStreakInsight(trades));

  return insights;
}
