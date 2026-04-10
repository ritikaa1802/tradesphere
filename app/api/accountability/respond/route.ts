import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getWeekWindow } from "@/lib/communityMetrics";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = (await request.json()) as { pairId?: string; action?: "accept" | "decline" };

  const pairId = String(body.pairId || "").trim();
  const action = body.action;

  if (!pairId || (action !== "accept" && action !== "decline")) {
    return NextResponse.json({ error: "pairId and a valid action are required" }, { status: 400 });
  }

  const { weekStart, weekEnd } = getWeekWindow(new Date());

  const pair = await prisma.accountabilityPair.findUnique({
    where: { id: pairId },
    select: {
      id: true,
      user1Id: true,
      user2Id: true,
      requesterId: true,
      status: true,
      weekStart: true,
      weekEnd: true,
    },
  });

  if (!pair || pair.status !== "pending") {
    return NextResponse.json({ error: "Pending request not found" }, { status: 404 });
  }

  if (pair.weekStart.getTime() !== weekStart.getTime() || pair.weekEnd.getTime() !== weekEnd.getTime()) {
    return NextResponse.json({ error: "This request is no longer active" }, { status: 409 });
  }

  const isParticipant = pair.user1Id === userId || pair.user2Id === userId;
  if (!isParticipant || pair.requesterId === userId) {
    return NextResponse.json({ error: "Only the receiving user can respond" }, { status: 403 });
  }

  if (action === "accept") {
    const hasAcceptedPair = await prisma.accountabilityPair.findFirst({
      where: {
        status: "accepted",
        weekStart,
        weekEnd,
        OR: [{ user1Id: userId }, { user2Id: userId }, { user1Id: pair.requesterId }, { user2Id: pair.requesterId }],
      },
      select: { id: true },
    });

    if (hasAcceptedPair) {
      return NextResponse.json({ error: "One of these users is already paired this week" }, { status: 409 });
    }
  }

  const updatedPair = await prisma.$transaction(async (tx) => {
    if (action === "accept") {
      await tx.accountabilityPair.updateMany({
        where: {
          id: { not: pair.id },
          status: "pending",
          weekStart,
          weekEnd,
          OR: [{ user1Id: userId }, { user2Id: userId }, { user1Id: pair.requesterId }, { user2Id: pair.requesterId }],
        },
        data: {
          status: "declined",
        },
      });
    }

    return tx.accountabilityPair.update({
      where: { id: pair.id },
      data: {
        status: action === "accept" ? "accepted" : "declined",
      },
      select: {
        id: true,
        status: true,
      },
    });
  });

  return NextResponse.json({
    success: true,
    pair: updatedPair,
  });
}
