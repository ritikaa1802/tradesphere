import prisma from "@/lib/prisma";
import { getHoldings } from "@/lib/portfolio";

export type MissionDefinition = {
  missionNumber: number;
  title: string;
  task: string;
  skill: string;
  description: string;
};

export const MISSION_DEFINITIONS: MissionDefinition[] = [
  {
    missionNumber: 1,
    title: "Place Your First Trade",
    task: "Buy any stock",
    skill: "Understanding market orders",
    description: "Execute your first buy order to understand how market execution works.",
  },
  {
    missionNumber: 2,
    title: "Try a Limit Order",
    task: "Place a limit order",
    skill: "Understanding limit vs market orders",
    description: "Use a limit order to control your entry price instead of instant execution.",
  },
  {
    missionNumber: 3,
    title: "Set a Stop Loss",
    task: "Place a stop loss order",
    skill: "Risk management",
    description: "Place a stop-loss order to protect downside before it happens.",
  },
  {
    missionNumber: 4,
    title: "Track Your Mood",
    task: "Place 3 trades with different moods",
    skill: "Emotional awareness",
    description: "Record at least three different emotional states across your trades.",
  },
  {
    missionNumber: 5,
    title: "Hold Through Volatility",
    task: "Hold a stock for 24 hours without selling",
    skill: "Patience and discipline",
    description: "Practice patience by holding at least one open position for a full day.",
  },
  {
    missionNumber: 6,
    title: "Review Your Mistakes",
    task: "Visit Bad Trades page",
    skill: "Learning from errors",
    description: "Visit the Bad Trades page and review the mistakes highlighted for you.",
  },
  {
    missionNumber: 7,
    title: "Diversify Portfolio",
    task: "Hold 3 different stocks simultaneously",
    skill: "Portfolio diversification",
    description: "Keep at least three distinct stocks in your active holdings together.",
  },
  {
    missionNumber: 8,
    title: "Get AI Coaching",
    task: "Generate AI weekly report",
    skill: "Using data to improve",
    description: "Generate your AI report and use coaching insights to refine your process.",
  },
  {
    missionNumber: 9,
    title: "Profitable Week",
    task: "End a day with positive P&L",
    skill: "Consistent profitability",
    description: "Close any trading day with a net positive realized P&L.",
  },
  {
    missionNumber: 10,
    title: "Join the Competition",
    task: "Join a trading competition",
    skill: "Competitive trading",
    description: "Join a live competition and pressure-test your discipline against others.",
  },
];

type MissionTriggerFlags = {
  visitedPath?: string;
  aiReportGenerated?: boolean;
  competitionJoined?: boolean;
};

async function ensureUserMissions(userId: string) {
  const existingCount = await prisma.mission.count({ where: { userId } });
  if (existingCount >= MISSION_DEFINITIONS.length) {
    return;
  }

  await prisma.mission.createMany({
    data: MISSION_DEFINITIONS.map((mission) => ({
      userId,
      missionNumber: mission.missionNumber,
      title: mission.title,
    })),
    skipDuplicates: true,
  });
}

async function hasOpenLotOlderThan24Hours(userId: string): Promise<boolean> {
  const trades = await prisma.trade.findMany({
    where: {
      userId,
      status: { in: ["executed", "triggered"] },
    },
    orderBy: { createdAt: "asc" },
    select: {
      stock: true,
      type: true,
      quantity: true,
      createdAt: true,
    },
  });

  const lotsByStock: Record<string, Array<{ quantity: number; createdAt: Date }>> = {};

  for (const trade of trades) {
    if (!lotsByStock[trade.stock]) {
      lotsByStock[trade.stock] = [];
    }

    if (trade.type === "buy") {
      lotsByStock[trade.stock].push({ quantity: trade.quantity, createdAt: trade.createdAt });
      continue;
    }

    let remainingSellQty = trade.quantity;
    const lots = lotsByStock[trade.stock];
    while (remainingSellQty > 0 && lots.length > 0) {
      const firstLot = lots[0];
      if (firstLot.quantity <= remainingSellQty) {
        remainingSellQty -= firstLot.quantity;
        lots.shift();
      } else {
        firstLot.quantity -= remainingSellQty;
        remainingSellQty = 0;
      }
    }
  }

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return Object.values(lotsByStock).some((lots) =>
    lots.some((lot) => lot.quantity > 0 && lot.createdAt.getTime() <= cutoff),
  );
}

async function checkMissionCompletionMap(userId: string, flags: MissionTriggerFlags) {
  const [allTrades, executedTrades, holdings, joinedCompetition] = await Promise.all([
    prisma.trade.findMany({
      where: { userId },
      select: {
        id: true,
        orderType: true,
        mood: true,
        pnl: true,
        status: true,
        createdAt: true,
        type: true,
      },
    }),
    prisma.trade.findMany({
      where: {
        userId,
        status: { in: ["executed", "triggered"] },
      },
      select: {
        mood: true,
        pnl: true,
        createdAt: true,
        type: true,
      },
    }),
    getHoldings(userId),
    prisma.competitionEntry.findFirst({ where: { userId }, select: { id: true } }),
  ]);

  const orderTypes = allTrades.map((trade) => trade.orderType.toLowerCase());
  const moods = new Set(
    executedTrades
      .map((trade) => (trade.mood || "").trim())
      .filter(Boolean)
      .map((mood) => mood.toLowerCase()),
  );

  const dailyPnl = new Map<string, number>();
  for (const trade of executedTrades) {
    if (trade.pnl === null) {
      continue;
    }
    const dayKey = trade.createdAt.toISOString().slice(0, 10);
    dailyPnl.set(dayKey, (dailyPnl.get(dayKey) || 0) + trade.pnl);
  }

  return {
    1: allTrades.length > 0,
    2: orderTypes.some((type) => type === "limit"),
    3: orderTypes.some((type) => ["stoploss", "stop_loss"].includes(type)),
    4: moods.size >= 3,
    5: await hasOpenLotOlderThan24Hours(userId),
    6: flags.visitedPath === "/mistakes",
    7: holdings.length >= 3,
    8: Boolean(flags.aiReportGenerated),
    9: Array.from(dailyPnl.values()).some((value) => value > 0),
    10: Boolean(flags.competitionJoined || joinedCompetition),
  } as Record<number, boolean>;
}

export function getMissionLevel(completedCount: number): string {
  if (completedCount <= 2) return "Beginner ??";
  if (completedCount <= 5) return "Learner ??";
  if (completedCount <= 8) return "Intermediate ?";
  return "Ready to Go Live ??";
}

export async function checkAndCompleteMissions(userId: string, flags: MissionTriggerFlags = {}) {
  await ensureUserMissions(userId);

  const completionMap = await checkMissionCompletionMap(userId, flags);
  const missions = await prisma.mission.findMany({
    where: { userId },
    orderBy: { missionNumber: "asc" },
  });

  const updates = missions
    .filter((mission) => !mission.completed && completionMap[mission.missionNumber])
    .map((mission) =>
      prisma.mission.update({
        where: { id: mission.id },
        data: { completed: true, completedAt: new Date() },
      }),
    );

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  const refreshed = await prisma.mission.findMany({ where: { userId }, orderBy: { missionNumber: "asc" } });
  const completedCount = refreshed.filter((mission) => mission.completed).length;
  const currentMissionNumber = refreshed.find((mission) => !mission.completed)?.missionNumber || 10;

  return {
    missions: refreshed.map((mission) => {
      const definition = MISSION_DEFINITIONS[mission.missionNumber - 1];
      return {
        ...mission,
        task: definition.task,
        skill: definition.skill,
        description: definition.description,
      };
    }),
    completedCount,
    totalMissions: MISSION_DEFINITIONS.length,
    level: getMissionLevel(completedCount),
    currentMissionNumber,
  };
}
