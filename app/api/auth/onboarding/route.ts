import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { traderType, tradingStyle } = await request.json();
  if (!traderType || !tradingStyle) {
    return NextResponse.json({ error: "Both traderType and tradingStyle are required" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { traderType, tradingStyle },
  });

  return NextResponse.json({ success: true, user });
}
