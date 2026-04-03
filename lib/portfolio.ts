import prisma from "@/lib/prisma";

export interface Holding {
  stock: string;
  quantity: number;
  avgBuyPrice: number;
  invested: number;
  currentValue: number; // since no real prices, maybe use last trade price or something, but for now, perhaps invested for currentValue?
  pnl: number;
}

export async function getHoldings(userId: string): Promise<Holding[]> {
  const trades = await prisma.trade.findMany({
    where: { userId },
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
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = holdings.reduce((sum, h) => sum + h.pnl, 0);
  const pnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return {
    balance: portfolio.balance,
    invested: totalInvested,
    pnl: totalPnl,
    pnlPercentage,
    holdings,
  };
}