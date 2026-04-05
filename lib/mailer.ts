import nodemailer from "nodemailer";

export function getMailer() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Gmail SMTP is not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendOtpEmail(email: string, otp: string) {
  const transporter = getMailer();

  await transporter.sendMail({
    from: `TradeSphere <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your TradeSphere OTP Code",
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;background:#0b1220;color:#e5e7eb;padding:24px;">
        <div style="max-width:560px;margin:0 auto;background:#111b30;border:1px solid #1f2d4d;border-radius:12px;padding:24px;">
          <h2 style="margin:0 0 12px 0;color:#ffffff;">TradeSphere Verification</h2>
          <p style="margin:0 0 16px 0;color:#9ca3af;">Use this 6-digit code to continue:</p>
          <div style="font-size:30px;letter-spacing:8px;font-weight:700;color:#60a5fa;margin:10px 0 18px 0;">${otp}</div>
          <p style="margin:0;color:#9ca3af;">This code expires in 10 minutes.</p>
        </div>
      </div>
    `,
  });
}
