import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { competitionId?: string };
  if (!body?.competitionId) {
    return NextResponse.json({ error: "competitionId is required" }, { status: 400 });
  }

  const competition = await prisma.competition.findFirst({ where: { id: body.competitionId } });
  if (!competition) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  }

  const symbol = `CONTEST_NOTIFY:${competition.id}`;
  const existing = await prisma.alert.findFirst({
    where: {
      userId: session.user.id,
      symbol,
      condition: "contest_notify",
    },
  });

  if (!existing) {
    await prisma.alert.create({
      data: {
        userId: session.user.id,
        symbol,
        targetPrice: 0,
        condition: "contest_notify",
      },
    });
  }

  return NextResponse.json({ success: true, message: `Notification enabled for ${competition.title}` });
}
