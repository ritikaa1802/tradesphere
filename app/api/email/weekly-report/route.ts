import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateWeeklyReport } from "@/lib/emailReport";
import { getMailer } from "@/lib/mailer";
import prisma from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isPro: true } });
  if (!user?.isPro) {
    return NextResponse.json({ error: "Pro plan required for weekly email report" }, { status: 403 });
  }

  try {
    const report = await generateWeeklyReport(session.user.id);
    const transporter = getMailer();

    await transporter.sendMail({
      from: `TradeSphere <${process.env.GMAIL_USER}>`,
      to: report.to,
      subject: report.subject,
      html: report.html,
    });

    return NextResponse.json({ success: true, message: "Weekly report sent successfully" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Failed to send weekly report" }, { status: 500 });
  }
}
