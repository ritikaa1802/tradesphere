import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    await resend.emails.send({
      from: "TradeSphere <onboarding@resend.dev>",
      to: email,
      subject: "Your TradeSphere verification code",
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;background:#060d1a;color:#e5e7eb;padding:24px;">
          <div style="max-width:560px;margin:0 auto;background:#0f1729;border:1px solid #1f2d4d;border-radius:12px;padding:24px;">
            <h2 style="margin:0 0 12px 0;color:#ffffff;">TradeSphere Verification</h2>
            <p style="margin:0 0 16px 0;color:#9ca3af;">Use this 6-digit code to continue:</p>
            <div style="font-size:30px;letter-spacing:8px;font-weight:700;color:#60a5fa;margin:10px 0 18px 0;">${otp}</div>
            <p style="margin:0;color:#9ca3af;">This code expires in 10 minutes.</p>
          </div>
        </div>
      `,
    });
  } catch {
    return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "OTP sent to your email" });
}
