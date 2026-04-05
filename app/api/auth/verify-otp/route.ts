import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body?.email || "").toLowerCase().trim();
  const otp = String(body?.otp || "").trim();
  const type = String(body?.type || "login");
  const password = String(body?.password || "");

  if (!email || !otp || !["login", "signup"].includes(type)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const latest = await prisma.oTP.findFirst({
    where: {
      email,
      verified: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!latest || latest.otp !== otp || latest.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  await prisma.oTP.update({
    where: { id: latest.id },
    data: { verified: true },
  });

  if (type === "signup") {
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    await prisma.portfolio.create({
      data: {
        userId: user.id,
        balance: 100000,
      },
    });
  }

  return NextResponse.json({ success: true, message: "OTP verified" });
}
