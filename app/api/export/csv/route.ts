import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } });
  if (!user?.isPro) {
    return NextResponse.json({ error: "Pro plan required for CSV export" }, { status: 403 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const header = ["Date", "Stock", "Type", "OrderType", "Price", "Qty", "Charges", "P&L", "Mood", "Note"];
  const rows = trades.map((trade) => [
    new Date(trade.createdAt).toISOString(),
    trade.stock,
    trade.type,
    trade.orderType,
    trade.price,
    trade.quantity,
    trade.charges,
    trade.pnl ?? "",
    trade.mood ?? "",
    trade.note ?? "",
  ]);

  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");

  const date = new Date().toISOString().slice(0, 10);
  const fileName = `tradesphere-trades-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${fileName}`,
      "Cache-Control": "no-store",
    },
  });
}
