import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { declareMonthlyChampion } from "@/lib/challenges";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const champion = await declareMonthlyChampion();
  if (!champion) {
    return NextResponse.json({ error: "No eligible entries this month" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    champion: {
      id: champion.id,
      month: champion.month,
      year: champion.year,
      disciplineScore: Number(champion.disciplineScore.toFixed(2)),
      displayName: champion.user.displayName || champion.user.email,
      badge: "👑",
      proUnlockedUntil: champion.proUnlockedUntil,
    },
  });
}
