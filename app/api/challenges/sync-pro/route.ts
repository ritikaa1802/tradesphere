import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncExpiredChallengePro } from "@/lib/challenges";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const changed = await syncExpiredChallengePro(session.user.id);
  return NextResponse.json({ success: true, changed });
}
