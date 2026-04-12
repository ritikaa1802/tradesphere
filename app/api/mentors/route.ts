import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getUserStats } from "@/lib/mentorMatching";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mentorProfiles = await prisma.mentorProfile.findMany({
    where: {
      isMentor: true,
      isAvailable: true,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  });

  if (mentorProfiles.length === 0) {
    return NextResponse.json({ mentors: [] });
  }

  const mentorIds = mentorProfiles.map((profile) => profile.userId);

  const activeCounts = await prisma.mentorship.groupBy({
    by: ["mentorId"],
    where: {
      mentorId: { in: mentorIds },
      status: "active",
    },
    _count: {
      _all: true,
    },
  });

  const activeCountMap = new Map(activeCounts.map((item) => [item.mentorId, item._count._all]));

  const mentors = await Promise.all(
    mentorProfiles.map(async (profile) => {
      const currentMentees = activeCountMap.get(profile.userId) ?? 0;
      const stats = await getUserStats(profile.userId);
      const hasSlots = currentMentees < profile.maxMentees;

      return {
        id: profile.id,
        mentorId: profile.userId,
        displayName: profile.user.displayName || "Mentor",
        experienceLevel: profile.experienceLevel,
        tradingStyle: profile.tradingStyle,
        bio: profile.bio.slice(0, 200),
        currentMentees,
        maxMentees: profile.maxMentees,
        isAvailable: profile.isAvailable && hasSlots,
        disciplineScore: stats.disciplineScore,
        winRate: Number(stats.winRate.toFixed(1)),
      };
    }),
  );

  return NextResponse.json({ mentors });
}
