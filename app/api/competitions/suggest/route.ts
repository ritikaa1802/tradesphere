import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    category?: string;
    prize?: string;
  };

  const title = body.title?.trim();
  const description = body.description?.trim();
  const category = body.category?.trim() || "General";
  const prize = body.prize?.trim() || "TBD";

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
  }

  await prisma.alert.create({
    data: {
      userId: session.user.id,
      symbol: "CONTEST_SUGGESTION",
      targetPrice: 0,
      condition: JSON.stringify({
        type: "contest_suggestion",
        title,
        description,
        category,
        prize,
        submittedAt: new Date().toISOString(),
      }),
    },
  });

  return NextResponse.json({ success: true, message: "Suggestion submitted. Thanks for helping shape new contests!" });
}
