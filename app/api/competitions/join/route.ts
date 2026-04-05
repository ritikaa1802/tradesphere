import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const competition = await prisma.competition.findFirst({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { startDate: "asc" },
  });

  if (!competition) {
    return NextResponse.json({ error: "No active competition found" }, { status: 404 });
  }

  await prisma.competitionEntry.upsert({
    where: {
      competitionId_userId: {
        competitionId: competition.id,
        userId: session.user.id,
      },
    },
    update: {},
    create: {
      competitionId: competition.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true, message: "Joined competition" });
}
