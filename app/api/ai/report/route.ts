import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";

type TradeRecord = {
  createdAt: Date;
  stock: string;
  type: string;
  price: number;
  quantity: number;
  charges: number | null;
  pnl: number | null;
  mood: string | null;
};

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
console.log("GROQ_API_KEY loaded:", !!GROQ_API_KEY, "model:", GROQ_MODEL); // debug only

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GROQ_API_KEY) {
    const err = "GROQ_API_KEY not configured";
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const groqClient = new Groq({ apiKey: GROQ_API_KEY });

  const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const trades = await prisma.trade.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: fromDate },
    },
    orderBy: { createdAt: "asc" },
  });

  const data = trades.map((trade: TradeRecord) => ({
    date: trade.createdAt.toISOString(),
    stock: trade.stock,
    type: trade.type,
    price: trade.price,
    quantity: trade.quantity,
    charges: trade.charges,
    pnl: trade.pnl,
    mood: trade.mood,
  }));

  const prompt = `You are a trading coach. Analyze these trades and moods: ${JSON.stringify(data)}.\nReturn a JSON with:\n- mistakes: top 3 behavioral mistakes this week (array of strings)\n- bestTrade: best trade and why it worked (string)\n- tip: 1 personalized tip for next week (string)\n- personalityTag: trader personality like 'Panic Seller', 'Impulsive Buyer', 'Disciplined Trader' (string)`;

  try {
    const result = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are a helpful and concise trading coach." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.9,
    });

    const text = result?.choices?.[0]?.message?.content || "";

    const cleaned = text.trim();
    const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const jsonContent = fencedMatch ? fencedMatch[1].trim() : cleaned;
    const objectMatch = jsonContent.match(/\{[\s\S]*\}$/);
    const candidate = objectMatch ? objectMatch[0] : jsonContent;
    const normalized = candidate.replace(/,\s*(?=[}\]])/g, "");

    let parsed;
    try {
      parsed = JSON.parse(normalized);
    } catch (e) {
      console.error("Failed to parse AI coach response", { text, normalized, error: e });
      return NextResponse.json({ error: "Failed to parse AI coach response", text: normalized }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Groq report error:", error);
    const details = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ error: "AI coach request failed", details }, { status: 500 });
  }
}
