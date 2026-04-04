import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchStockPrice } from "@/lib/stockApi";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const triggeredAlerts = [] as Array<{ id: string; symbol: string; targetPrice: number; currentPrice: number; condition: string }>;

  for (const alert of alerts) {
    const currentPrice = await fetchStockPrice(alert.symbol);
    if (currentPrice === null) {
      continue;
    }

    const shouldTrigger = alert.condition === "above"
      ? currentPrice >= alert.targetPrice
      : currentPrice <= alert.targetPrice;

    if (shouldTrigger) {
      if (!alert.triggered) {
        await prisma.alert.update({
          where: { id: alert.id },
          data: { triggered: true },
        });
      }

      triggeredAlerts.push({
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        currentPrice,
        condition: alert.condition,
      });
    }
  }

  return NextResponse.json({ triggeredAlerts });
}
