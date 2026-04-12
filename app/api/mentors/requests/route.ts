import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getMentorEligibility, getRecentTradeCount, getUserStats } from "@/lib/mentorMatching";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [user, mentorProfile, pendingRequest, activeMentorship, incomingRequests, activeMentees, eligibility] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isMentor: true,
        isPro: true,
        displayName: true,
      },
    }),
    prisma.mentorProfile.findUnique({ where: { userId } }),
    prisma.mentorship.findFirst({
      where: {
        menteeId: userId,
        status: "pending",
      },
      include: {
        mentor: {
          select: {
            id: true,
            displayName: true,
            mentorProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mentorship.findFirst({
      where: {
        menteeId: userId,
        status: "active",
      },
      include: {
        mentor: {
          select: {
            id: true,
            displayName: true,
            mentorProfile: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.mentorship.findMany({
      where: {
        mentorId: userId,
        status: "pending",
      },
      include: {
        mentee: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mentorship.findMany({
      where: {
        mentorId: userId,
        status: "active",
      },
      include: {
        mentee: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    }),
    getMentorEligibility(userId),
  ]);

  const incomingWithStats = await Promise.all(
    incomingRequests.map(async (request) => {
      const [stats, recentTrades] = await Promise.all([
        getUserStats(request.mentee.id),
        getRecentTradeCount(request.mentee.id),
      ]);

      return {
        id: request.id,
        createdAt: request.createdAt,
        mentee: {
          id: request.mentee.id,
          displayName: request.mentee.displayName || "Trader",
          disciplineScore: stats.disciplineScore,
          recentTrades,
          winRate: Number(stats.winRate.toFixed(1)),
        },
      };
    }),
  );

  const activeMenteesWithStats = await Promise.all(
    activeMentees.map(async (mentorship) => {
      const [stats, recentTrades] = await Promise.all([
        getUserStats(mentorship.mentee.id),
        getRecentTradeCount(mentorship.mentee.id),
      ]);

      return {
        id: mentorship.id,
        startedAt: mentorship.startedAt,
        mentee: {
          id: mentorship.mentee.id,
          displayName: mentorship.mentee.displayName || "Trader",
          disciplineScore: stats.disciplineScore,
          recentTrades,
          winRate: Number(stats.winRate.toFixed(1)),
        },
      };
    }),
  );

  return NextResponse.json({
    viewer: {
      id: user?.id,
      displayName: user?.displayName || "Trader",
      isMentor: Boolean(user?.isMentor),
      isPro: Boolean(user?.isPro),
      eligibility,
      mentorProfile,
    },
    mentee: {
      pendingRequest: pendingRequest
        ? {
            id: pendingRequest.id,
            status: pendingRequest.status,
            createdAt: pendingRequest.createdAt,
            mentor: {
              id: pendingRequest.mentor.id,
              displayName: pendingRequest.mentor.displayName || "Mentor",
              profile: pendingRequest.mentor.mentorProfile,
            },
          }
        : null,
      activeMentorship: activeMentorship
        ? {
            id: activeMentorship.id,
            status: activeMentorship.status,
            startedAt: activeMentorship.startedAt,
            mentor: {
              id: activeMentorship.mentor.id,
              displayName: activeMentorship.mentor.displayName || "Mentor",
              profile: activeMentorship.mentor.mentorProfile,
            },
          }
        : null,
    },
    mentor: {
      incomingRequests: incomingWithStats,
      activeMentees: activeMenteesWithStats,
    },
  });
}
