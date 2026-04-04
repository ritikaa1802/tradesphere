import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Order id is required" }, { status: 400 });
  }

  const order = await prisma.trade.findFirst({
    where: {
      id,
      userId: session.user.id,
      status: "pending",
      orderType: { in: ["limit", "stopLoss"] },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pending order not found" }, { status: 404 });
  }

  const updated = await prisma.trade.update({
    where: { id },
    data: { status: "cancelled" },
  });

  return NextResponse.json({ success: true, order: updated });
}
