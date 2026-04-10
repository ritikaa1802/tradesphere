import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentAcceptedPairForUser } from "@/lib/accountability";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pair = await getCurrentAcceptedPairForUser(session.user.id);
  if (!pair) {
    return NextResponse.json({ pair: null, partner: null });
  }

  const partner = pair.user1Id === session.user.id ? pair.user2 : pair.user1;

  return NextResponse.json({
    pair: {
      id: pair.id,
      weekStart: pair.weekStart,
      weekEnd: pair.weekEnd,
      user1ReviewDone: pair.user1ReviewDone,
      user2ReviewDone: pair.user2ReviewDone,
    },
    partner: {
      id: partner.id,
      displayName: partner.displayName,
    },
  });
}
