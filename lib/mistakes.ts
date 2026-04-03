import prisma from "@/lib/prisma";

export interface Trade {
  id: string;
  stock: string;
  type: string;
  price: number;
  quantity: number;
  charges: number;
  pnl: number | null;
  note: string | null;
  mood: string | null;
  createdAt: Date;
  userId: string;
}

export interface Mistake {
  type: string;
  description: string;
  why: string;
  suggestion: string;
  trade: Trade;
}

// Panic sell: Sold within 10 min of a previous buy of same stock
export function detectPanicSell(trades: Trade[]): Mistake[] {
  const mistakes: Mistake[] = [];
  const stockBuys: Record<string, Trade[]> = {};

  trades.forEach((trade) => {
    if (trade.type === "buy") {
      if (!stockBuys[trade.stock]) stockBuys[trade.stock] = [];
      stockBuys[trade.stock].push(trade);
    } else if (trade.type === "sell") {
      const buys = stockBuys[trade.stock] || [];
      const recentBuy = buys.find((buy) => {
        const timeDiff = new Date(trade.createdAt).getTime() - new Date(buy.createdAt).getTime();
        return timeDiff > 0 && timeDiff <= 10 * 60 * 1000; // within 10 min
      });
      if (recentBuy) {
        mistakes.push({
          type: "Panic Sell",
          description: `Sold ${trade.stock} within 10 minutes of buying it`,
          why: "Panic selling often locks in losses and prevents potential recovery",
          suggestion: "Set stop-loss levels and give trades time to breathe",
          trade,
        });
      }
    }
  });

  return mistakes;
}

// Revenge trade: New trade placed within 15 min of a loss
export function detectRevengeTrade(trades: Trade[]): Mistake[] {
  const mistakes: Mistake[] = [];
  const sortedTrades = trades.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  for (let i = 1; i < sortedTrades.length; i++) {
    const prevTrade = sortedTrades[i - 1];
    const currentTrade = sortedTrades[i];

    if (prevTrade.type === "sell" && prevTrade.pnl !== null && prevTrade.pnl < 0) {
      const timeDiff = new Date(currentTrade.createdAt).getTime() - new Date(prevTrade.createdAt).getTime();
      if (timeDiff <= 15 * 60 * 1000) { // within 15 min
        mistakes.push({
          type: "Revenge Trade",
          description: `Placed new trade within 15 minutes of a loss on ${prevTrade.stock}`,
          why: "Trading out of frustration often leads to impulsive decisions",
          suggestion: "Take a break after losses and review your strategy",
          trade: currentTrade,
        });
      }
    }
  }

  return mistakes;
}

// Overtrading: More than 5 trades in a single day
export function detectOvertrading(trades: Trade[]): Mistake[] {
  const mistakes: Mistake[] = [];
  const tradesByDay: Record<string, Trade[]> = {};

  trades.forEach((trade) => {
    const date = new Date(trade.createdAt).toISOString().split("T")[0];
    if (!tradesByDay[date]) tradesByDay[date] = [];
    tradesByDay[date].push(trade);
  });

  Object.entries(tradesByDay).forEach(([date, dayTrades]) => {
    if (dayTrades.length > 5) {
      dayTrades.forEach((trade) => {
        mistakes.push({
          type: "Overtrading",
          description: `More than 5 trades on ${date} (${dayTrades.length} total)`,
          why: "Overtrading increases transaction costs and reduces focus",
          suggestion: "Limit to 3-5 high-quality trades per day",
          trade,
        });
      });
    }
  });

  return mistakes;
}

// FOMO entry: Bought with mood = "FOMO"
export function detectFOMOEntry(trades: Trade[]): Mistake[] {
  const mistakes: Mistake[] = [];

  trades.forEach((trade) => {
    if (trade.type === "buy" && trade.mood === "FOMO") {
      mistakes.push({
        type: "FOMO Entry",
        description: `Bought ${trade.stock} while feeling FOMO`,
        why: "FOMO trades are often impulsive and enter at peaks",
        suggestion: "Wait for confirmation signals, don't chase momentum",
        trade,
      });
    }
  });

  return mistakes;
}

// Holding losers too long: Buy with no matching sell, older than 3 days, at loss
export function detectHoldingLosers(trades: Trade[]): Mistake[] {
  const mistakes: Mistake[] = [];
  const holdings: Record<string, { buy: Trade; quantity: number }> = {};

  trades.forEach((trade) => {
    if (trade.type === "buy") {
      holdings[trade.stock] = { buy: trade, quantity: trade.quantity };
    } else if (trade.type === "sell") {
      if (holdings[trade.stock]) {
        holdings[trade.stock].quantity -= trade.quantity;
        if (holdings[trade.stock].quantity <= 0) {
          delete holdings[trade.stock];
        }
      }
    }
  });

  Object.values(holdings).forEach(({ buy }) => {
    const age = (Date.now() - new Date(buy.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (age > 3) {
      // Assume current price is buy price for simplicity, or we could use last trade price
      // For now, since no real prices, consider it at loss if held long
      mistakes.push({
        type: "Holding Losers Too Long",
        description: `Holding ${buy.stock} for ${Math.floor(age)} days without selling`,
        why: "Holding losing positions too long ties up capital and increases risk",
        suggestion: "Cut losses early, set stop-losses, and move capital to better opportunities",
        trade: buy,
      });
    }
  });

  return mistakes;
}

// Early profit booking: Sold with positive P&L but mood was "Anxious" or "Fearful"
export function detectEarlyProfitBooking(trades: Trade[]): Mistake[] {
  const mistakes: Mistake[] = [];

  trades.forEach((trade) => {
    if (trade.type === "sell" && trade.pnl !== null && trade.pnl > 0 &&
        (trade.mood === "Anxious" || trade.mood === "Fearful")) {
      mistakes.push({
        type: "Early Profit Booking",
        description: `Sold ${trade.stock} for profit while feeling ${trade.mood}`,
        why: "Selling winners too early prevents bigger gains",
        suggestion: "Let profits run, use trailing stops, and trust your analysis",
        trade,
      });
    }
  });

  return mistakes;
}

export function detectAllMistakes(trades: Trade[]): Mistake[] {
  return [
    ...detectPanicSell(trades),
    ...detectRevengeTrade(trades),
    ...detectOvertrading(trades),
    ...detectFOMOEntry(trades),
    ...detectHoldingLosers(trades),
    ...detectEarlyProfitBooking(trades),
  ];
}