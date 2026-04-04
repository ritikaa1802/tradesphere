import { NextRequest, NextResponse } from "next/server";
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

  const withPrices = await Promise.all(
    alerts.map(async (alert) => {
      const currentPrice = await fetchStockPrice(alert.symbol);
      return {
        ...alert,
        currentPrice,
      };
    }),
  );

  return NextResponse.json({ alerts: withPrices });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    symbol?: string;
    targetPrice?: number;
    condition?: string;
  };

  const symbol = String(body.symbol || "").trim().toUpperCase();
  const targetPrice = Number(body.targetPrice);
  const condition = String(body.condition || "").trim().toLowerCase();

  if (!symbol || !Number.isFinite(targetPrice) || targetPrice <= 0 || !["above", "below"].includes(condition)) {
    return NextResponse.json({ error: "Invalid alert payload" }, { status: 400 });
  }

  const alert = await prisma.alert.create({
    data: {
      userId: session.user.id,
      symbol,
      targetPrice,
      condition,
    },
  });

  return NextResponse.json({ success: true, alert });
}
