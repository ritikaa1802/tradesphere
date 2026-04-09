import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { enabled?: boolean };
  const enabled = Boolean(body.enabled);

  const settings = await prisma.accountabilitySettings.upsert({
    where: { userId: session.user.id },
    update: { enabled },
    create: { userId: session.user.id, enabled },
  });

  return NextResponse.json({ success: true, settings });
}
