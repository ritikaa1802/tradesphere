import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPortfolioSummary } from "@/lib/portfolio";
import { getSectorForSymbol } from "@/lib/stockApi";

function getDiversificationScore(percentages: number[]) {
  if (percentages.length === 0) {
    return 1;
  }

  const hhi = percentages.reduce((sum, pct) => sum + Math.pow(pct / 100, 2), 0);
  const effective = 1 / hhi;
  const normalized = ((effective - 1) / 5) * 9 + 1;
  return Math.max(1, Math.min(10, Number(normalized.toFixed(1))));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getPortfolioSummary(session.user.id);
  const map: Record<string, number> = {};

  for (const holding of summary.holdings) {
    const sector = getSectorForSymbol(holding.stock);
    map[sector] = (map[sector] || 0) + holding.currentValue;
  }

  const total = Object.values(map).reduce((sum, value) => sum + value, 0);
  const sectors = Object.entries(map).map(([sector, value]) => ({
    sector,
    value,
    percentage: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.value - a.value);

  const score = getDiversificationScore(sectors.map((item) => item.percentage));
  const label = score <= 3
    ? "Highly Concentrated ⚠️"
    : score <= 6
      ? "Moderately Diversified"
      : "Well Diversified ✅";

  const covered = new Set(sectors.map((item) => item.sector));
  const suggestedSector = ["IT", "Banking", "Auto", "Pharma", "Energy"].find((sector) => !covered.has(sector)) || "Others";

  return NextResponse.json({
    sectors,
    diversification: {
      score,
      label,
      tip: `Consider adding exposure to ${suggestedSector} to improve diversification.`,
    },
  });
}
