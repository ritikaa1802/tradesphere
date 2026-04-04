import prisma from "@/lib/prisma";
import { getHoldings } from "@/lib/portfolio";
import { fetchStockPrice } from "@/lib/stockApi";

export async function processPendingOrders(userId: string) {
  const pendingOrders = await prisma.trade.findMany({
    where: {
      userId,
      status: "pending",
      orderType: { in: ["limit", "stopLoss"] },
    },
    orderBy: { createdAt: "asc" },
  });

  if (pendingOrders.length === 0) {
    return { triggered: 0 };
  }

  const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
  if (!portfolio) {
    return { triggered: 0 };
  }

  let balance = portfolio.balance;
  let triggered = 0;

  for (const order of pendingOrders) {
    if (typeof order.targetPrice !== "number" || order.targetPrice <= 0) {
      continue;
    }

    const currentPrice = await fetchStockPrice(order.stock);
    if (currentPrice === null) {
      continue;
    }

    const shouldTrigger = order.orderType === "limit"
      ? (order.type === "buy" ? currentPrice <= order.targetPrice : currentPrice >= order.targetPrice)
      : currentPrice <= order.targetPrice;

    if (!shouldTrigger) {
      continue;
    }

    const executionPrice = currentPrice;
    const tradeValue = executionPrice * order.quantity;
    const brokerage = 20 + (order.type === "buy" ? 0.001 * tradeValue : 0);

    if (order.type === "buy") {
      const totalCost = tradeValue + brokerage;
      if (totalCost > balance) {
        continue;
      }
      balance -= totalCost;

      await prisma.trade.update({
        where: { id: order.id },
        data: {
          status: "triggered",
          price: executionPrice,
          charges: brokerage,
          pnl: null,
        },
      });
      triggered += 1;
      continue;
    }

    const holdings = await getHoldings(userId);
    const holding = holdings.find((item) => item.stock.toUpperCase() === order.stock.toUpperCase());
    if (!holding || holding.quantity < order.quantity) {
      continue;
    }

    const pnl = (executionPrice - holding.avgBuyPrice) * order.quantity - brokerage;
    balance += tradeValue - brokerage;

    await prisma.trade.update({
      where: { id: order.id },
      data: {
        status: "triggered",
        price: executionPrice,
        charges: brokerage,
        pnl,
      },
    });
    triggered += 1;
  }

  await prisma.portfolio.update({
    where: { userId },
    data: { balance },
  });

  return { triggered };
}
