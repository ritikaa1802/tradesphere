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

  const body = await request.json();
  const question = String(body.question || "").trim();
  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  const history = trades.map((trade: TradeRecord) => ({
    date: trade.createdAt.toISOString(),
    stock: trade.stock,
    type: trade.type,
    price: trade.price,
    quantity: trade.quantity,
    pnl: trade.pnl,
    mood: trade.mood,
  }));

  const prompt = `You are a trading coach. Here is the user's trade history: ${JSON.stringify(history)}. The user asks: ${question}. Provide a concise coaching response.`;

  try {
    const result = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are a supportive trading coach." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.9,
    });

    const answer = result?.choices?.[0]?.message?.content || "";
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Groq chat error:", error);
    const details = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ error: "AI coach request failed", details }, { status: 500 });
  }
}
