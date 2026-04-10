import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function currentMonthYear() {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1).padStart(2, "0"),
    year: String(now.getFullYear()),
  };
}

export async function GET() {
  const { month, year } = currentMonthYear();

  const champion = await prisma.monthlyChampion.findUnique({
    where: { month_year: { month, year } },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
  });

  if (!champion) {
    return NextResponse.json({ champion: null });
  }

  return NextResponse.json({
    champion: {
      id: champion.id,
      month: champion.month,
      year: champion.year,
      displayName: champion.user.displayName || champion.user.email,
      disciplineScore: Number(champion.disciplineScore.toFixed(2)),
      badge: "👑",
      proUnlockedUntil: champion.proUnlockedUntil,
      createdAt: champion.createdAt,
    },
  });
}
