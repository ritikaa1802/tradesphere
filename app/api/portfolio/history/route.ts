import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface HoldingAccumulator {
  quantity: number;
  lastPrice: number;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["executed", "triggered"] },
    },
    orderBy: { createdAt: "asc" },
    select: {
      stock: true,
      type: true,
      price: true,
      quantity: true,
      charges: true,
      createdAt: true,
    },
  });

  let cashBalance = 100000;
  const holdings: Record<string, HoldingAccumulator> = {};

  const history = trades.map((trade) => {
    if (!holdings[trade.stock]) {
      holdings[trade.stock] = {
        quantity: 0,
        lastPrice: trade.price,
      };
    }

    if (trade.type === "buy") {
      cashBalance -= trade.price * trade.quantity + trade.charges;
      holdings[trade.stock].quantity += trade.quantity;
      holdings[trade.stock].lastPrice = trade.price;
    } else {
      cashBalance += trade.price * trade.quantity - trade.charges;
      holdings[trade.stock].quantity -= trade.quantity;
      holdings[trade.stock].lastPrice = trade.price;
    }

    const holdingsValue = Object.values(holdings).reduce((sum, item) => {
      if (item.quantity <= 0) {
        return sum;
      }
      return sum + item.quantity * item.lastPrice;
    }, 0);

    return {
      date: trade.createdAt.toISOString().slice(0, 10),
      portfolioValue: Number((cashBalance + holdingsValue).toFixed(2)),
    };
  });

  return NextResponse.json(history);
}
