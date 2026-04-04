import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processPendingOrders } from "@/lib/orders";
import { fetchStockPrice } from "@/lib/stockApi";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await processPendingOrders(session.user.id);

  const orders = await prisma.trade.findMany({
    where: {
      userId: session.user.id,
      orderType: { in: ["limit", "stopLoss"] },
      status: { in: ["pending", "triggered", "cancelled"] },
    },
    orderBy: { createdAt: "desc" },
  });

  const withCurrentPrice = await Promise.all(
    orders.map(async (order) => {
      const currentPrice = await fetchStockPrice(order.stock);
      return {
        ...order,
        currentPrice,
      };
    }),
  );

  return NextResponse.json({ orders: withCurrentPrice });
}
