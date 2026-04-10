import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    pairId?: string;
    revieweeId?: string;
    doneWell?: string;
    mistakes?: string;
    suggestions?: string;
  };

  const pairId = String(body.pairId || "").trim();
  const revieweeId = String(body.revieweeId || "").trim();
  const doneWell = String(body.doneWell || "").trim();
  const mistakes = String(body.mistakes || "").trim();
  const suggestions = String(body.suggestions || "").trim();

  if (!pairId || !revieweeId || !doneWell || !mistakes || !suggestions) {
    return NextResponse.json({ error: "All review fields are required" }, { status: 400 });
  }

  const pair = await prisma.accountabilityPair.findUnique({ where: { id: pairId } });
  if (!pair) {
    return NextResponse.json({ error: "Pair not found" }, { status: 404 });
  }

  const acceptedPair = await prisma.accountabilityPair.findFirst({
    where: {
      id: pairId,
      status: "accepted",
    },
    select: { id: true },
  });

  if (!acceptedPair) {
    return NextResponse.json({ error: "Reviews are only allowed for accepted pairs" }, { status: 400 });
  }

  if (pair.user1Id !== session.user.id && pair.user2Id !== session.user.id) {
    return NextResponse.json({ error: "Not allowed for this pair" }, { status: 403 });
  }

  if (revieweeId === session.user.id) {
    return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 });
  }

  if (![pair.user1Id, pair.user2Id].includes(revieweeId)) {
    return NextResponse.json({ error: "Reviewee must belong to this pair" }, { status: 400 });
  }

  const review = await prisma.accountabilityReview.upsert({
    where: {
      pairId_reviewerId: {
        pairId,
        reviewerId: session.user.id,
      },
    },
    update: {
      revieweeId,
      doneWell,
      mistakes,
      suggestions,
      createdAt: new Date(),
    },
    create: {
      pairId,
      reviewerId: session.user.id,
      revieweeId,
      doneWell,
      mistakes,
      suggestions,
    },
  });

  await prisma.accountabilityPair.update({
    where: { id: pairId },
    data: session.user.id === pair.user1Id ? { user1ReviewDone: true } : { user2ReviewDone: true },
  });

  return NextResponse.json({ success: true, review });
}
