import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mentorId = session.user.id;
  const body = (await request.json()) as { mentorshipId?: string; action?: "accept" | "decline" };

  const mentorshipId = String(body.mentorshipId || "").trim();
  const action = body.action;

  if (!mentorshipId || (action !== "accept" && action !== "decline")) {
    return NextResponse.json({ error: "mentorshipId and a valid action are required" }, { status: 400 });
  }

  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    select: {
      id: true,
      mentorId: true,
      menteeId: true,
      status: true,
    },
  });

  if (!mentorship || mentorship.mentorId !== mentorId || mentorship.status !== "pending") {
    return NextResponse.json({ error: "Pending mentorship request not found" }, { status: 404 });
  }

  if (action === "accept") {
    const [mentorProfile, currentMentees, menteeActive] = await Promise.all([
      prisma.mentorProfile.findUnique({ where: { userId: mentorId } }),
      prisma.mentorship.count({ where: { mentorId, status: "active" } }),
      prisma.mentorship.findFirst({
        where: {
          menteeId: mentorship.menteeId,
          status: "active",
        },
        select: { id: true },
      }),
    ]);

    if (!mentorProfile || !mentorProfile.isAvailable) {
      return NextResponse.json({ error: "Mentor profile is unavailable" }, { status: 409 });
    }

    if (currentMentees >= mentorProfile.maxMentees) {
      return NextResponse.json({ error: "No available mentor slots" }, { status: 409 });
    }

    if (menteeActive) {
      return NextResponse.json({ error: "Mentee already has an active mentorship" }, { status: 409 });
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedMentorship = await tx.mentorship.update({
      where: { id: mentorship.id },
      data:
        action === "accept"
          ? {
              status: "active",
              startedAt: new Date(),
            }
          : {
              status: "declined",
            },
    });

    if (action === "accept") {
      await tx.mentorship.updateMany({
        where: {
          id: { not: mentorship.id },
          menteeId: mentorship.menteeId,
          status: "pending",
        },
        data: {
          status: "declined",
        },
      });
    }

    return updatedMentorship;
  });

  return NextResponse.json({ success: true, mentorship: updated });
}
