import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureWeeklyPairForUser } from "@/lib/accountability";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pair = await ensureWeeklyPairForUser(session.user.id);
  return NextResponse.json({ pair });
}
