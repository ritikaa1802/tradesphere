import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$transaction([
    prisma.trade.deleteMany({ where: { userId: session.user.id } }),
    prisma.portfolio.update({
      where: { userId: session.user.id },
      data: { balance: 100000 },
    }),
  ]);

  return NextResponse.json({ success: true, message: "Portfolio reset successfully" });
}
