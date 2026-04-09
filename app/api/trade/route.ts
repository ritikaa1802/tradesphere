import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getHoldings } from "@/lib/portfolio";
import { checkAndCompleteMissions } from "@/lib/missions";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const stock = String(body.stock || "").trim();
  const type = String(body.type || "").toLowerCase();
  const orderType = String(body.orderType || "market").toLowerCase();
  const targetPrice = body.targetPrice === null || body.targetPrice === undefined ? null : Number(body.targetPrice);
  const price = Number(body.price);
  const quantity = Number(body.quantity);
  const note = String(body.note || "");
  const emotionalState = String(body.emotionalState || "").trim();
  const followedPlan = String(body.followedPlan || "").trim();
  const tradeReason = String(body.tradeReason || "").trim().slice(0, 100);

  if (!stock || !["buy", "sell"].includes(type) || !["market", "limit", "stoploss"].includes(orderType) || !price || !quantity) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!emotionalState || !followedPlan || !tradeReason) {
    return NextResponse.json({ error: "Emotional check-in is required" }, { status: 400 });
  }

  if (orderType !== "market" && (typeof targetPrice !== "number" || !Number.isFinite(targetPrice) || targetPrice <= 0)) {
    return NextResponse.json({ error: "Target price is required for limit/stop loss orders" }, { status: 400 });
  }

  const portfolio = await prisma.portfolio.findUnique({ where: { userId: session.user.id } });
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  if (type === "sell") {
    const holdings = await getHoldings(session.user.id);
    const holding = holdings.find(h => h.stock.toUpperCase() === stock.toUpperCase());
    if (!holding || holding.quantity < quantity) {
      return NextResponse.json({ error: "Insufficient holdings to sell" }, { status: 400 });
    }
  }

  if (orderType !== "market") {
    const pendingOrder = await prisma.trade.create({
      data: {
        userId: session.user.id,
        stock,
        type,
        orderType: orderType === "stoploss" ? "stopLoss" : orderType,
        status: "pending",
        targetPrice,
        price,
        quantity,
        charges: 0,
        pnl: null,
        note: note || null,
        mood: emotionalState || null,
        emotionalState,
        followedPlan,
        tradeReason,
      },
    });

    await checkAndCompleteMissions(session.user.id);

    return NextResponse.json({
      success: true,
      pending: true,
      trade: pendingOrder,
      message: `${orderType === "limit" ? "Limit" : "Stop Loss"} order placed successfully`,
    });
  }

  const tradeValue = price * quantity;
  const brokerage = 20 + (type === "buy" ? 0.001 * tradeValue : 0); // ₹20 flat + 0.1% STT on buy

  let pnl: number | null = null;
  if (type === "sell") {
    const holdings = await getHoldings(session.user.id);
    const holding = holdings.find(h => h.stock.toUpperCase() === stock.toUpperCase());
    if (!holding) {
      return NextResponse.json({ error: "Insufficient holdings to sell" }, { status: 400 });
    }
    const avgBuyPrice = holding.avgBuyPrice;
    pnl = (price - avgBuyPrice) * quantity - brokerage;
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
      orderType: "market",
      status: "executed",
      targetPrice: null,
      price,
      quantity,
      charges: brokerage,
      pnl,
      note: note || null,
      mood: emotionalState || null,
      emotionalState,
      followedPlan,
      tradeReason,
    },
  });

  await prisma.portfolio.update({
    where: { userId: session.user.id },
    data: { balance: newBalance },
  });

  await checkAndCompleteMissions(session.user.id);

  return NextResponse.json({ success: true, trade, balance: newBalance });
}
