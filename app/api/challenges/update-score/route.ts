import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateChallengeScoresForTrade } from "@/lib/challenges";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    followedPlan?: string;
    emotionalState?: string;
    tradeReason?: string;
    checklistCompleted?: boolean;
  };

  const result = await updateChallengeScoresForTrade({
    userId: session.user.id,
    followedPlan: body.followedPlan,
    emotionalState: body.emotionalState,
    tradeReason: body.tradeReason,
    checklistCompleted: body.checklistCompleted,
  });

  return NextResponse.json({ success: true, updatedEntries: result.updated });
}
