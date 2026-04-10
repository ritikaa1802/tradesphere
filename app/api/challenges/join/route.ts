import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureDefaultChallenges, recalculateRanks } from "@/lib/challenges";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDefaultChallenges();

  const body = (await request.json()) as { challengeId?: string };
  const challengeId = String(body.challengeId || "").trim();

  if (!challengeId) {
    return NextResponse.json({ error: "challengeId is required" }, { status: 400 });
  }

  const [challenge, user] = await Promise.all([
    prisma.cohortChallenge.findUnique({ where: { id: challengeId }, include: { _count: { select: { entries: true } } } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, isPro: true } }),
  ]);

  if (!challenge || !challenge.isActive) {
    return NextResponse.json({ error: "Challenge is not available" }, { status: 404 });
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (challenge.isPro && !user.isPro) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  if (challenge._count.entries >= challenge.maxParticipants) {
    return NextResponse.json({ error: "Challenge is full" }, { status: 409 });
  }

  const existing = await prisma.cohortEntry.findUnique({
    where: {
      challengeId_userId: {
        challengeId,
        userId: user.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ success: true, entry: existing, message: "Already joined" });
  }

  const entry = await prisma.cohortEntry.create({
    data: {
      challengeId,
      userId: user.id,
    },
  });

  await recalculateRanks(challengeId);

  return NextResponse.json({ success: true, entry });
}
