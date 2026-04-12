import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasActiveOrPendingMenteeRequest } from "@/lib/mentorMatching";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const menteeId = session.user.id;
  const body = (await request.json()) as { mentorId?: string };
  const mentorId = String(body.mentorId || "").trim();

  if (!mentorId) {
    return NextResponse.json({ error: "mentorId is required" }, { status: 400 });
  }

  if (mentorId === menteeId) {
    return NextResponse.json({ error: "You cannot request yourself" }, { status: 400 });
  }

  const [mentorProfile, menteeHasExisting] = await Promise.all([
    prisma.mentorProfile.findUnique({
      where: { userId: mentorId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    }),
    hasActiveOrPendingMenteeRequest(menteeId),
  ]);

  if (!mentorProfile || !mentorProfile.isMentor || !mentorProfile.isAvailable) {
    return NextResponse.json({ error: "Mentor is not available" }, { status: 404 });
  }

  if (menteeHasExisting) {
    return NextResponse.json({ error: "You can only have one active mentorship request at a time" }, { status: 409 });
  }

  const currentMentees = await prisma.mentorship.count({
    where: {
      mentorId,
      status: "active",
    },
  });

  if (currentMentees >= mentorProfile.maxMentees) {
    return NextResponse.json({ error: "Mentor has no available slots" }, { status: 409 });
  }

  const duplicate = await prisma.mentorship.findFirst({
    where: {
      mentorId,
      menteeId,
      status: "pending",
    },
    select: { id: true },
  });

  if (duplicate) {
    return NextResponse.json({ error: "Request already pending" }, { status: 409 });
  }

  const mentorship = await prisma.mentorship.create({
    data: {
      mentorId,
      menteeId,
      status: "pending",
    },
  });

  return NextResponse.json({
    success: true,
    mentorship: {
      id: mentorship.id,
      mentor: {
        id: mentorProfile.user.id,
        displayName: mentorProfile.user.displayName,
      },
      status: mentorship.status,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const menteeId = session.user.id;
  const body = (await request.json()) as { mentorshipId?: string };
  const mentorshipId = String(body.mentorshipId || "").trim();

  if (!mentorshipId) {
    return NextResponse.json({ error: "mentorshipId is required" }, { status: 400 });
  }

  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    select: { id: true, menteeId: true, status: true },
  });

  if (!mentorship || mentorship.menteeId !== menteeId || mentorship.status !== "pending") {
    return NextResponse.json({ error: "Cannot cancel this request" }, { status: 403 });
  }

  await prisma.mentorship.delete({ where: { id: mentorship.id } });

  return NextResponse.json({ success: true });
}
