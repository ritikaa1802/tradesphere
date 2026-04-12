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
  const body = (await request.json()) as {
    mentorshipId?: string;
    weekNumber?: number;
    whatWentWell?: string;
    areasToImprove?: string;
    focusNextWeek?: string;
  };

  const mentorshipId = String(body.mentorshipId || "").trim();
  const weekNumber = Number(body.weekNumber || 0);
  const whatWentWell = String(body.whatWentWell || "").trim();
  const areasToImprove = String(body.areasToImprove || "").trim();
  const focusNextWeek = String(body.focusNextWeek || "").trim();

  if (!mentorshipId || !weekNumber || !whatWentWell || !areasToImprove || !focusNextWeek) {
    return NextResponse.json(
      { error: "mentorshipId, weekNumber, whatWentWell, areasToImprove and focusNextWeek are required" },
      { status: 400 },
    );
  }

  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    select: {
      id: true,
      mentorId: true,
      status: true,
    },
  });

  if (!mentorship || mentorship.mentorId !== mentorId || mentorship.status !== "active") {
    return NextResponse.json({ error: "Active mentorship not found" }, { status: 404 });
  }

  const feedback = await prisma.mentorFeedback.create({
    data: {
      mentorshipId: mentorship.id,
      weekNumber,
      whatWentWell,
      areasToImprove,
      focusNextWeek,
    },
  });

  return NextResponse.json({ success: true, feedback });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const menteeId = session.user.id;

  const [user, feedbackList] = await Promise.all([
    prisma.user.findUnique({ where: { id: menteeId }, select: { isPro: true } }),
    prisma.mentorFeedback.findMany({
      where: {
        mentorship: {
          menteeId,
        },
      },
      include: {
        mentorship: {
          select: {
            mentor: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: "asc" }, { weekNumber: "asc" }],
    }),
  ]);

  const isPro = Boolean(user?.isPro);
  const visibleFeedback = isPro ? feedbackList : feedbackList.slice(-4);

  return NextResponse.json({
    feedback: visibleFeedback,
    isPro,
    totalFeedbackCount: feedbackList.length,
    proLocked: !isPro && feedbackList.length > 4,
  });
}
