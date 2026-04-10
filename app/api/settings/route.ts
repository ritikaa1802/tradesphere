import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      showOnLeaderboard: true,
      displayName: true,
      accountabilityMode: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    showOnLeaderboard: user.showOnLeaderboard,
    displayName: user.displayName,
    accountabilityEnabled: user.accountabilityMode,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { showOnLeaderboard?: boolean; displayName?: string; accountabilityEnabled?: boolean };
  const showOnLeaderboard = Boolean(body.showOnLeaderboard);
  const accountabilityEnabled = Boolean(body.accountabilityEnabled);
  const displayNameRaw = (body.displayName || "").trim();
  const displayName = displayNameRaw.length > 0 ? displayNameRaw.slice(0, 32) : null;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      showOnLeaderboard,
      displayName,
      accountabilityMode: accountabilityEnabled,
    },
    select: {
      showOnLeaderboard: true,
      displayName: true,
      accountabilityMode: true,
    },
  });

  return NextResponse.json({ success: true, user: { ...user, accountabilityEnabled: user.accountabilityMode } });
}
