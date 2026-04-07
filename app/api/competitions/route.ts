import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const templates = [
    {
      title: "NSE Masters Cup 2026 - Season 3",
      description: "India's biggest paper trading championship with 30-day market simulation.",
      prizeDescription: "Rs.300,000 total prize pool",
      startOffsetDays: -4,
      endOffsetDays: 26,
      isActive: true,
    },
    {
      title: "Intraday Blitz - Daily",
      description: "Daily intraday contest reset each morning for momentum and execution skills.",
      prizeDescription: "Rs.100,000 prize pool",
      startOffsetDays: -1,
      endOffsetDays: 1,
      isActive: true,
    },
    {
      title: "AI Strategy Showdown",
      description: "Build and defend a strategy where AI coaching score contributes to ranking.",
      prizeDescription: "Rs.75,000 prize pool",
      startOffsetDays: -2,
      endOffsetDays: 12,
      isActive: true,
    },
    {
      title: "First Trade Challenge",
      description: "Guided 7-day beginner challenge focused on order types and risk habits.",
      prizeDescription: "Rs.25,000 prize pool",
      startOffsetDays: -1,
      endOffsetDays: 8,
      isActive: true,
    },
    {
      title: "Budget Impact Challenge",
      description: "Trade macro setups around budget themes and policy-sensitive sectors.",
      prizeDescription: "Rs.80,000 prize pool",
      startOffsetDays: 4,
      endOffsetDays: 14,
      isActive: false,
    },
    {
      title: "Q4 Earnings Season Cup",
      description: "Capture earnings-driven volatility with disciplined position management.",
      prizeDescription: "Rs.50,000 prize pool",
      startOffsetDays: 7,
      endOffsetDays: 17,
      isActive: false,
    },
    {
      title: "Women in Trading Invitational",
      description: "Inclusive paper-trading challenge with a coaching-first progression.",
      prizeDescription: "Rs.30,000 prize pool",
      startOffsetDays: 10,
      endOffsetDays: 20,
      isActive: false,
    },
    {
      title: "Sector Rotation Marathon",
      description: "30-day macro sector rotation challenge across Pharma, IT, FMCG, and Banks.",
      prizeDescription: "Rs.120,000 prize pool",
      startOffsetDays: 14,
      endOffsetDays: 44,
      isActive: false,
    },
  ] as const;

  await Promise.all(
    templates.map(async (template) => {
      const existing = await prisma.competition.findFirst({ where: { title: template.title } });
      if (existing) return;

      await prisma.competition.create({
        data: {
          title: template.title,
          description: template.description,
          prizeDescription: template.prizeDescription,
          startDate: new Date(now.getTime() + template.startOffsetDays * dayMs),
          endDate: new Date(now.getTime() + template.endOffsetDays * dayMs),
          isActive: template.isActive,
        },
      });
    }),
  );

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
