import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getWeekWindow } from "@/lib/communityMetrics";

function orderedPair(a: string, b: string) {
  return a < b ? [a, b] as const : [b, a] as const;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requesterId = session.user.id;
  const body = (await request.json()) as { targetUserId?: string };
  const targetUserId = String(body.targetUserId || "").trim();

  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
  }

  if (targetUserId === requesterId) {
    return NextResponse.json({ error: "You cannot request yourself" }, { status: 400 });
  }

  const [requester, target] = await Promise.all([
    prisma.user.findUnique({
      where: { id: requesterId },
      select: { id: true, accountabilityMode: true },
    }),
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, accountabilityMode: true, displayName: true },
    }),
  ]);

  if (!requester?.accountabilityMode) {
    return NextResponse.json({ error: "Enable Accountability Mode first" }, { status: 400 });
  }

  if (!target?.id || !target.accountabilityMode) {
    return NextResponse.json({ error: "Target user is unavailable for pairing" }, { status: 404 });
  }

  const { weekStart, weekEnd } = getWeekWindow(new Date());

  const existingPendingRequest = await prisma.accountabilityPair.findFirst({
    where: {
      requesterId,
      status: "pending",
      weekStart,
      weekEnd,
    },
    select: { id: true },
  });

  if (existingPendingRequest) {
    return NextResponse.json({ error: "You already have a pending request" }, { status: 409 });
  }

  const existingAcceptedPair = await prisma.accountabilityPair.findFirst({
    where: {
      weekStart,
      weekEnd,
      status: "accepted",
      OR: [{ user1Id: requesterId }, { user2Id: requesterId }, { user1Id: targetUserId }, { user2Id: targetUserId }],
    },
    select: { id: true },
  });

  if (existingAcceptedPair) {
    return NextResponse.json({ error: "One of the users is already paired this week" }, { status: 409 });
  }

  const [user1Id, user2Id] = orderedPair(requesterId, targetUserId);

  const existingPair = await prisma.accountabilityPair.findFirst({
    where: {
      weekStart,
      weekEnd,
      user1Id,
      user2Id,
    },
    select: { id: true, status: true },
  });

  if (existingPair?.status === "pending") {
    return NextResponse.json({ error: "A request between these users is already pending" }, { status: 409 });
  }

  if (existingPair?.status === "accepted") {
    return NextResponse.json({ error: "These users are already paired this week" }, { status: 409 });
  }

  const pair = existingPair
    ? await prisma.accountabilityPair.update({
        where: { id: existingPair.id },
        data: {
          status: "pending",
          requesterId,
          user1ReviewDone: false,
          user2ReviewDone: false,
        },
      })
    : await prisma.accountabilityPair.create({
        data: {
          weekStart,
          weekEnd,
          user1Id,
          user2Id,
          requesterId,
          status: "pending",
        },
      });

  return NextResponse.json({
    success: true,
    request: {
      id: pair.id,
      targetUser: {
        id: target.id,
        displayName: target.displayName,
      },
      status: pair.status,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requesterId = session.user.id;
  const body = (await request.json()) as { pairId?: string };
  const pairId = String(body.pairId || "").trim();

  if (!pairId) {
    return NextResponse.json({ error: "pairId is required" }, { status: 400 });
  }

  const pair = await prisma.accountabilityPair.findUnique({
    where: { id: pairId },
    select: { id: true, requesterId: true, status: true },
  });

  if (!pair) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (pair.requesterId !== requesterId || pair.status !== "pending") {
    return NextResponse.json({ error: "Cannot cancel this request" }, { status: 403 });
  }

  await prisma.accountabilityPair.delete({ where: { id: pair.id } });

  return NextResponse.json({ success: true });
}
