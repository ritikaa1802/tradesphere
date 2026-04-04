import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { symbol: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbol = decodeURIComponent(params.symbol || "").trim().toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  await prisma.watchlist.deleteMany({
    where: {
      userId: session.user.id,
      symbol,
    },
  });

  return NextResponse.json({ success: true });
}
