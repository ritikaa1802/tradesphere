import prisma from "@/lib/prisma";
import { fetchStockPrice } from "@/lib/stockApi";

export interface Holding {
  stock: string;
  quantity: number;
  avgBuyPrice: number;
  invested: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
}

export async function getHoldings(userId: string): Promise<Holding[]> {
  const trades = await prisma.trade.findMany({
    where: {
      userId,
      status: { in: ["executed", "triggered"] },
    },
    orderBy: { createdAt: "asc" },
  });

  const holdingsMap: Record<string, { totalQty: number; totalInvested: number; lastPrice: number }> = {};

  for (const trade of trades) {
    const stock = trade.stock;
    if (!holdingsMap[stock]) {
      holdingsMap[stock] = { totalQty: 0, totalInvested: 0, lastPrice: trade.price };
    }

    if (trade.type === "buy") {
      holdingsMap[stock].totalQty += trade.quantity;
      holdingsMap[stock].totalInvested += trade.price * trade.quantity + trade.charges;
      holdingsMap[stock].lastPrice = trade.price;
    } else if (trade.type === "sell") {
      holdingsMap[stock].totalQty -= trade.quantity;
      // For sell, we don't add to invested, but update lastPrice
      holdingsMap[stock].lastPrice = trade.price;
    }
  }

  const holdings: Holding[] = [];
  for (const [stock, data] of Object.entries(holdingsMap)) {
    if (data.totalQty > 0) {
      const avgBuyPrice = data.totalInvested / data.totalQty; // approximate, since charges are included
      const invested = data.totalInvested;
      const currentValue = data.lastPrice * data.totalQty; // using last trade price as current
      const pnl = currentValue - invested;
      holdings.push({
        stock,
        quantity: data.totalQty,
        avgBuyPrice,
        invested,
        currentPrice: data.lastPrice,
        currentValue,
        pnl,
      });
    }
  }

  return holdings;
}

export async function getPortfolioSummary(userId: string) {
  const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
  if (!portfolio) throw new Error("Portfolio not found");

  const holdings = await getHoldings(userId);
  const holdingsWithLivePrices = await Promise.all(
    holdings.map(async (holding) => {
      const livePrice = await fetchStockPrice(holding.stock);
      const currentPrice = livePrice ?? holding.currentPrice;
      const currentValue = currentPrice * holding.quantity;
      const pnl = currentValue - holding.invested;

      return {
        ...holding,
        currentPrice,
        currentValue,
        pnl,
      };
    }),
  );

  const totalInvested = holdingsWithLivePrices.reduce((sum, h) => sum + h.invested, 0);
  const totalCurrentValue = holdingsWithLivePrices.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = holdingsWithLivePrices.reduce((sum, h) => sum + h.pnl, 0);
  const pnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return {
    balance: portfolio.balance,
    invested: totalInvested,
    pnl: totalPnl,
    pnlPercentage,
    holdings: holdingsWithLivePrices,
    lastUpdated: new Date().toISOString(),
  };
}