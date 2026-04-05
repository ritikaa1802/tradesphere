import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = body?.email?.toLowerCase()?.trim();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashed = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      traderType: null,
      tradingStyle: null,
    },
  });

  await prisma.portfolio.create({
    data: {
      userId: user.id,
      balance: 100000,
    },
  });

  return NextResponse.json(
    {
      success: true,
      redirectTo: "/onboarding",
      user: { id: user.id, email: user.email },
    },
    { status: 201 },
  );
}
