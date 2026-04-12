import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EXPERIENCE_LEVELS, TRADING_STYLES, getMentorEligibility } from "@/lib/mentorMatching";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [eligibility, user, existingProfile] = await Promise.all([
    getMentorEligibility(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true, isMentor: true },
    }),
    prisma.mentorProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    eligibility,
    isPro: Boolean(user?.isPro),
    isMentor: Boolean(user?.isMentor),
    profile: existingProfile,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = (await request.json()) as {
    bio?: string;
    experienceLevel?: string;
    tradingStyle?: string;
    maxMentees?: number;
  };

  const bio = String(body.bio || "").trim();
  const experienceLevel = String(body.experienceLevel || "").trim();
  const tradingStyle = String(body.tradingStyle || "").trim();
  const maxMentees = Number(body.maxMentees || 0);

  if (!bio || !experienceLevel || !tradingStyle || !maxMentees) {
    return NextResponse.json({ error: "bio, experienceLevel, tradingStyle and maxMentees are required" }, { status: 400 });
  }

  if (bio.length > 200) {
    return NextResponse.json({ error: "Bio must be 200 characters or less" }, { status: 400 });
  }

  if (!EXPERIENCE_LEVELS.includes(experienceLevel as (typeof EXPERIENCE_LEVELS)[number])) {
    return NextResponse.json({ error: "Invalid experienceLevel" }, { status: 400 });
  }

  if (!TRADING_STYLES.includes(tradingStyle as (typeof TRADING_STYLES)[number])) {
    return NextResponse.json({ error: "Invalid tradingStyle" }, { status: 400 });
  }

  if (maxMentees < 1 || maxMentees > 5) {
    return NextResponse.json({ error: "maxMentees must be between 1 and 5" }, { status: 400 });
  }

  const [eligibility, user, existingProfile] = await Promise.all([
    getMentorEligibility(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } }),
    prisma.mentorProfile.findUnique({ where: { userId } }),
  ]);

  if (!eligibility.canRegister) {
    return NextResponse.json(
      {
        error: "You do not meet mentor registration requirements",
        missing: eligibility.missing,
        eligibility,
      },
      { status: 400 },
    );
  }

  if (existingProfile) {
    return NextResponse.json({ error: "You are already registered as a mentor" }, { status: 409 });
  }

  if (maxMentees > 2 && !user?.isPro) {
    return NextResponse.json(
      { error: "Mentor capacity above 2 mentees is Pro only", requiresPro: true },
      { status: 403 },
    );
  }

  const profile = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isMentor: true },
    });

    return tx.mentorProfile.create({
      data: {
        userId,
        isMentor: true,
        bio,
        experienceLevel,
        tradingStyle,
        maxMentees,
        isAvailable: true,
      },
    });
  });

  return NextResponse.json({ success: true, profile });
}
