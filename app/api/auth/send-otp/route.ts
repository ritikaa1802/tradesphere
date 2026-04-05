import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { sendOtpEmail } from "@/lib/mailer";

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body?.email || "").toLowerCase().trim();
  const password = String(body?.password || "");
  const type = String(body?.type || "login");

  if (!email || !["login", "signup"].includes(type)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (type === "login") {
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  }

  if (type === "signup") {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
  }

  const otp = createOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.oTP.create({
    data: {
      email,
      otp,
      expiresAt,
      verified: false,
    },
  });

  try {
    await sendOtpEmail(email, otp);
  } catch {
    return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "OTP sent to your email" });
}
