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
    select: { shownLessons: true },
  });

  return NextResponse.json({ shownLessons: user?.shownLessons || [] });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { lessonKey?: string };
  const lessonKey = (body.lessonKey || "").trim();
  if (!lessonKey) {
    return NextResponse.json({ error: "lessonKey is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { shownLessons: true },
  });

  const existing = new Set(user?.shownLessons || []);
  existing.add(lessonKey);

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { shownLessons: Array.from(existing) },
    select: { shownLessons: true },
  });

  return NextResponse.json({ success: true, shownLessons: updated.shownLessons });
}
