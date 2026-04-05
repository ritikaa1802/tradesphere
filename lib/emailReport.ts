import Groq from "groq-sdk";
import prisma from "@/lib/prisma";
import { detectAllMistakes } from "@/lib/mistakes";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function getDateLabel(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export async function generateWeeklyReport(userId: string) {
  const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, displayName: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const trades = await prisma.trade.findMany({
    where: {
      userId,
      createdAt: { gte: fromDate },
      status: { in: ["executed", "triggered"] },
    },
    orderBy: { createdAt: "asc" },
  });

  const realized = trades.filter((trade) => trade.pnl !== null);
  const wins = realized.filter((trade) => (trade.pnl ?? 0) > 0);
  const losses = realized.filter((trade) => (trade.pnl ?? 0) < 0);

  const totalTrades = trades.length;
  const winRate = realized.length > 0 ? (wins.length / realized.length) * 100 : 0;

  const bestTrade = wins.reduce((best, current) => {
    if (!best || (current.pnl ?? 0) > (best.pnl ?? 0)) {
      return current;
    }
    return best;
  }, wins[0] || null);

  const worstTrade = losses.reduce((worst, current) => {
    if (!worst || (current.pnl ?? 0) < (worst.pnl ?? 0)) {
      return current;
    }
    return worst;
  }, losses[0] || null);

  const moodMap: Record<string, { total: number; count: number }> = {};
  for (const trade of realized) {
    const mood = (trade.mood || "Neutral").trim() || "Neutral";
    if (!moodMap[mood]) {
      moodMap[mood] = { total: 0, count: 0 };
    }
    moodMap[mood].total += trade.pnl ?? 0;
    moodMap[mood].count += 1;
  }

  const topMood = Object.entries(moodMap)
    .map(([mood, value]) => ({ mood, avg: value.total / Math.max(1, value.count) }))
    .sort((a, b) => b.avg - a.avg)[0];

  const mistakes = detectAllMistakes(trades);
  const mistakeCounts: Record<string, number> = {};
  for (const mistake of mistakes) {
    mistakeCounts[mistake.type] = (mistakeCounts[mistake.type] || 0) + 1;
  }

  const topMistake = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "No major pattern";

  let aiTip = "Trade with clear entry/exit rules and pause after consecutive losses.";
  if (process.env.GROQ_API_KEY) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        temperature: 0.6,
        max_tokens: 140,
        messages: [
          {
            role: "system",
            content: "You are a concise trading coach. Provide one practical tip in 1-2 lines.",
          },
          {
            role: "user",
            content: `Weekly data: totalTrades=${totalTrades}, winRate=${winRate.toFixed(1)}%, topMistake=${topMistake}, bestMood=${topMood?.mood || "Neutral"}. Give a personalized next-week tip.`,
          },
        ],
      });

      aiTip = (completion.choices[0]?.message?.content || aiTip).trim();
    } catch {
      // Keep fallback tip if AI call fails.
    }
  }

  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;background:#060d1a;padding:26px;color:#d1d5db;">
    <div style="max-width:680px;margin:0 auto;border:1px solid #1f2b47;border-radius:14px;overflow:hidden;background:#0d1421;">
      <div style="background:#0b1e3a;padding:18px 24px;">
        <h1 style="margin:0;color:#fff;font-size:24px;">TradeSphere Weekly Report</h1>
        <p style="margin:6px 0 0;color:#9fb3d9;">${getDateLabel(fromDate)} - ${getDateLabel(new Date())}</p>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;">Hi ${user.displayName || user.email}, here is your weekly performance snapshot.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr>
            <td style="padding:10px;border:1px solid #1f2b47;">Total Trades</td>
            <td style="padding:10px;border:1px solid #1f2b47;font-weight:700;">${totalTrades}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #1f2b47;">Win Rate</td>
            <td style="padding:10px;border:1px solid #1f2b47;font-weight:700;">${winRate.toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #1f2b47;">Best Mood Pattern</td>
            <td style="padding:10px;border:1px solid #1f2b47;font-weight:700;">${topMood?.mood || "Not enough mood data"}</td>
          </tr>
        </table>

        <div style="padding:14px;border:1px solid #1f2b47;border-radius:10px;background:#0f1d34;margin-bottom:14px;">
          <p style="margin:0 0 6px;font-weight:700;color:#34d399;">Best Trade</p>
          <p style="margin:0;">${bestTrade ? `${bestTrade.stock} (${bestTrade.type.toUpperCase()}) with P&L ₹${(bestTrade.pnl ?? 0).toFixed(2)}` : "No profitable trades this week."}</p>
        </div>

        <div style="padding:14px;border:1px solid #1f2b47;border-radius:10px;background:#2b1220;margin-bottom:14px;">
          <p style="margin:0 0 6px;font-weight:700;color:#fb7185;">Top Mistake This Week</p>
          <p style="margin:0;">${topMistake}</p>
          <p style="margin:8px 0 0;color:#94a3b8;">Worst trade: ${worstTrade ? `${worstTrade.stock} (₹${(worstTrade.pnl ?? 0).toFixed(2)})` : "N/A"}</p>
        </div>

        <div style="padding:14px;border:1px solid #1f2b47;border-radius:10px;background:#10233f;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-weight:700;color:#60a5fa;">AI Tip</p>
          <p style="margin:0;">${aiTip}</p>
        </div>

        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:700;">View Full Report</a>
      </div>
    </div>
  </div>
  `;

  return {
    to: user.email,
    subject: "Your TradeSphere Weekly Report",
    html,
  };
}
