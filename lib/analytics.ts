import prisma from "@/lib/prisma";

export interface AnalyticsSummary {
  totalTrades: number;
  winRate: number;
  averageProfit: number;
  averageLoss: number;
  bestPerformingStock: { stock: string; totalPnl: number } | null;
  mostTradedStock: { stock: string; count: number } | null;
  bestTradingDay: { date: string; totalPnl: number } | null;
  worstTradingDay: { date: string; totalPnl: number } | null;
  currentWinStreak: number;
  currentLossStreak: number;
  riskRewardRatio: number;
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const trades = await prisma.trade.findMany({
    where: { userId, pnl: { not: null } },
    orderBy: { createdAt: "asc" },
  });

  const totalTrades = trades.length;
  const winningTrades = trades.filter((trade) => (trade.pnl ?? 0) > 0);
  const losingTrades = trades.filter((trade) => (trade.pnl ?? 0) < 0);

  const averageProfit = winningTrades.length
    ? winningTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0) / winningTrades.length
    : 0;

  const averageLoss = losingTrades.length
    ? losingTrades.reduce((sum, trade) => sum + Math.abs(trade.pnl ?? 0), 0) / losingTrades.length
    : 0;

  const riskRewardRatio = averageLoss > 0 ? averageProfit / averageLoss : 0;
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

  const stockPnlMap: Record<string, number> = {};
  const stockCountMap: Record<string, number> = {};
  const dayPnlMap: Record<string, number> = {};

  for (const trade of trades) {
    const stock = trade.stock;
    const pnlValue = trade.pnl ?? 0;
    const dateKey = getDateKey(trade.createdAt);

    stockPnlMap[stock] = (stockPnlMap[stock] ?? 0) + pnlValue;
    stockCountMap[stock] = (stockCountMap[stock] ?? 0) + 1;
    dayPnlMap[dateKey] = (dayPnlMap[dateKey] ?? 0) + pnlValue;
  }

  const bestPerformingStock = Object.entries(stockPnlMap).reduce(
    (best, [stock, totalPnl]) => {
      if (!best || totalPnl > best.totalPnl) {
        return { stock, totalPnl };
      }
      return best;
    },
    null as { stock: string; totalPnl: number } | null,
  );

  const mostTradedStock = Object.entries(stockCountMap).reduce(
    (best, [stock, count]) => {
      if (!best || count > best.count) {
        return { stock, count };
      }
      return best;
    },
    null as { stock: string; count: number } | null,
  );

  const bestTradingDay = Object.entries(dayPnlMap).reduce(
    (best, [date, totalPnl]) => {
      if (!best || totalPnl > best.totalPnl) {
        return { date, totalPnl };
      }
      return best;
    },
    null as { date: string; totalPnl: number } | null,
  );

  const worstTradingDay = Object.entries(dayPnlMap).reduce(
    (worst, [date, totalPnl]) => {
      if (!worst || totalPnl < worst.totalPnl) {
        return { date, totalPnl };
      }
      return worst;
    },
    null as { date: string; totalPnl: number } | null,
  );

  let currentWinStreak = 0;
  let currentLossStreak = 0;
  if (trades.length > 0) {
    const lastTrade = trades[trades.length - 1];
    if ((lastTrade.pnl ?? 0) > 0) {
      for (let i = trades.length - 1; i >= 0; i -= 1) {
        if ((trades[i].pnl ?? 0) > 0) {
          currentWinStreak += 1;
        } else {
          break;
        }
      }
    } else if ((lastTrade.pnl ?? 0) < 0) {
      for (let i = trades.length - 1; i >= 0; i -= 1) {
        if ((trades[i].pnl ?? 0) < 0) {
          currentLossStreak += 1;
        } else {
          break;
        }
      }
    }
  }

  return {
    totalTrades,
    winRate,
    averageProfit,
    averageLoss,
    bestPerformingStock,
    mostTradedStock,
    bestTradingDay,
    worstTradingDay,
    currentWinStreak,
    currentLossStreak,
    riskRewardRatio,
  };
}
