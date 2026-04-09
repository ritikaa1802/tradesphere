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
    reviewedUserId?: string;
    goodPoints?: string;
    mistakes?: string;
    suggestions?: string;
  };

  const pairId = String(body.pairId || "").trim();
  const reviewedUserId = String(body.reviewedUserId || "").trim();
  const goodPoints = String(body.goodPoints || "").trim();
  const mistakes = String(body.mistakes || "").trim();
  const suggestions = String(body.suggestions || "").trim();

  if (!pairId || !reviewedUserId || !goodPoints || !mistakes || !suggestions) {
    return NextResponse.json({ error: "All review fields are required" }, { status: 400 });
  }

  const pair = await prisma.accountabilityPair.findUnique({ where: { id: pairId } });
  if (!pair) {
    return NextResponse.json({ error: "Pair not found" }, { status: 404 });
  }

  if (pair.userAId !== session.user.id && pair.userBId !== session.user.id) {
    return NextResponse.json({ error: "Not allowed for this pair" }, { status: 403 });
  }

  if (reviewedUserId === session.user.id) {
    return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 });
  }

  const review = await prisma.partnerReview.upsert({
    where: {
      pairId_reviewerId: {
        pairId,
        reviewerId: session.user.id,
      },
    },
    update: {
      reviewedUserId,
      goodPoints,
      mistakes,
      suggestions,
      submittedAt: new Date(),
    },
    create: {
      pairId,
      reviewerId: session.user.id,
      reviewedUserId,
      goodPoints,
      mistakes,
      suggestions,
    },
  });

  return NextResponse.json({ success: true, review });
}
