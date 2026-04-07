import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let competitionId: string | undefined;
  try {
    const body = (await request.json()) as { competitionId?: string };
    competitionId = body?.competitionId;
  } catch {
    competitionId = undefined;
  }

  const now = new Date();
  const competition = competitionId
    ? await prisma.competition.findFirst({ where: { id: competitionId } })
    : await prisma.competition.findFirst({
        where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
        orderBy: { startDate: "asc" },
      });

  if (!competition) {
    return NextResponse.json({ error: "No active competition found" }, { status: 404 });
  }

  if (competition.startDate > now) {
    return NextResponse.json({ error: "This contest has not started yet. Use Notify for updates." }, { status: 400 });
  }

  if (competition.endDate < now || !competition.isActive) {
    return NextResponse.json({ error: "This contest is not currently open." }, { status: 400 });
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

  return NextResponse.json({ success: true, message: `Joined ${competition.title}` });
}
