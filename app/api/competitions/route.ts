import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  const active = await prisma.competition.findFirst({
    where: { isActive: true, endDate: { gte: now } },
    orderBy: { startDate: "asc" },
  });

  if (!active) {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 10 * 24 * 60 * 60 * 1000);

    await prisma.competition.create({
      data: {
        title: "April Trading Sprint",
        description: "Compete with traders to maximize gain percentage with disciplined risk.",
        startDate,
        endDate,
        prizeDescription: "Winner gets TradeSphere Pro for 3 months + Featured Badge",
        isActive: true,
      },
    });
  }

  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  });

  return NextResponse.json(competitions);
}
