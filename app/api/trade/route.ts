import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getHoldings } from "@/lib/portfolio";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const stock = String(body.stock || "").trim();
  const type = String(body.type || "").toLowerCase();
  const price = Number(body.price);
  const quantity = Number(body.quantity);
  const note = String(body.note || "");
  const mood = String(body.mood || "");

  if (!stock || !["buy", "sell"].includes(type) || !price || !quantity) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const portfolio = await prisma.portfolio.findUnique({ where: { userId: session.user.id } });
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const tradeValue = price * quantity;
  const brokerage = 20 + (type === "buy" ? 0.001 * tradeValue : 0); // ₹20 flat + 0.1% STT on buy

  let pnl: number | null = null;
  if (type === "sell") {
    const holdings = await getHoldings(session.user.id);
    const holding = holdings.find(h => h.stock === stock);
    if (holding && holding.quantity >= quantity) {
      const avgBuyPrice = holding.avgBuyPrice;
      pnl = (price - avgBuyPrice) * quantity - brokerage;
    } else {
      return NextResponse.json({ error: "Insufficient holdings to sell" }, { status: 400 });
    }
  }

  let newBalance = portfolio.balance;
  if (type === "buy") {
    const total = tradeValue + brokerage;
    if (total > portfolio.balance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }
    newBalance -= total;
  } else {
    // sell
    newBalance += tradeValue - brokerage;
  }

  const trade = await prisma.trade.create({
    data: {
      userId: session.user.id,
      stock,
      type,
      price,
      quantity,
      charges: brokerage,
      pnl,
      note: note || null,
      mood: mood || null,
    },
  });

  await prisma.portfolio.update({
    where: { userId: session.user.id },
    data: { balance: newBalance },
  });

  return NextResponse.json({ success: true, trade, balance: newBalance });
}
