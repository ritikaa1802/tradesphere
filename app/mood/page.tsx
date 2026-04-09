"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MoodData {
  moodFrequency: Record<string, number>;
  avgPnlPerMood: Record<string, number>;
  moodPerDay: Record<string, string>;
}

interface TradeItem {
  id: string;
  pnl: number | null;
  mood: string | null;
  followedPlan?: string | null;
}

const moods = ["Confident", "Anxious", "Neutral", "FOMO", "Greedy", "Fearful"];
const moodColors: Record<string, string> = {
  Confident: "bg-green-500",
  Anxious: "bg-red-500",
  Neutral: "bg-gray-500",
  FOMO: "bg-yellow-500",
  Greedy: "bg-purple-500",
  Fearful: "bg-blue-500",
};

export default function MoodPage() {
  const [data, setData] = useState<MoodData | null>(null);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "patterns">("overview");
  const router = useRouter();

  useEffect(() => {
    fetchMoodData();
  }, []);

  async function fetchMoodData() {
    try {
      const res = await fetch("/api/mood");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch mood data");
      }
      const moodData = await res.json();
      setData(moodData);

      const tradesRes = await fetch("/api/trades", { cache: "no-store" });
      if (tradesRes.ok) {
        const tradeRows = (await tradesRes.json()) as TradeItem[];
        setTrades(tradeRows);
      }
    } catch (err) {
      setError("Failed to load mood data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="mb-4 text-3xl font-semibold text-white">TradeMind</h1>
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="mb-4 text-3xl font-semibold text-white">TradeMind</h1>
          <p className="text-rose-400">{error}</p>
        </div>
      </main>
    );
  }

  // Prepare chart data
  const chartData = moods.map((mood) => ({
    mood,
    avgPnl: data.avgPnlPerMood[mood] || 0,
  }));

  const patternTrades = trades.slice(0, 10).reverse().map((trade, index) => ({
    x: `T${index + 1}`,
    pnl: trade.pnl ?? 0,
    mood: trade.mood || "Neutral",
    followedPlan: (trade.followedPlan || "").toLowerCase(),
  }));

  const patternColorMap: Record<string, string> = {
    confident: "#22c55e",
    anxious: "#ef4444",
    calm: "#3b82f6",
    impulsive: "#f97316",
  };

  const calmTrades = trades.filter((trade) => (trade.mood || "").toLowerCase() === "calm" && trade.pnl !== null);
  const calmWins = calmTrades.filter((trade) => (trade.pnl ?? 0) > 0).length;
  const calmWinRate = calmTrades.length > 0 ? (calmWins / calmTrades.length) * 100 : 0;
  const impulsiveTrades = trades.filter((trade) => (trade.mood || "").toLowerCase() === "impulsive" && trade.pnl !== null);
  const impulsiveLosses = impulsiveTrades.filter((trade) => (trade.pnl ?? 0) < 0).length;
  const planFollowed = trades.filter((trade) => ((trade.followedPlan || "").toLowerCase() === "yes")).length;
  const planFollowPct = trades.length > 0 ? (planFollowed / trades.length) * 100 : 0;

  // Find best mood
  const bestMood = Object.keys(data.avgPnlPerMood).reduce((a, b) =>
    data.avgPnlPerMood[a] > data.avgPnlPerMood[b] ? a : b, ""
  );

  // Generate calendar for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const mood = data.moodPerDay[dateStr];
    calendarDays.push({ day, mood });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">TradeMind</h1>
          <p className="mt-2 text-slate-400">Understand how your mood impacts trade performance.</p>
          <div className="mt-4 inline-flex rounded-lg border border-slate-700 bg-slate-900 p-1 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`rounded px-3 py-1.5 ${activeTab === "overview" ? "bg-blue-600 text-white" : "text-slate-300"}`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("patterns")}
              className={`rounded px-3 py-1.5 ${activeTab === "patterns" ? "bg-blue-600 text-white" : "text-slate-300"}`}
            >
              My Patterns
            </button>
          </div>
        </div>

        {activeTab === "overview" && bestMood && (
          <div className="mb-6 rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
            <p className="text-lg text-slate-200">
              You trade best when <span className="font-bold text-green-400">{bestMood}</span>
            </p>
            {Object.keys(data.avgPnlPerMood).length > 1 && (
              <p className="mt-2 text-sm text-slate-400">
                Your worst trades happen when you're in {Object.keys(data.avgPnlPerMood).reduce((a, b) =>
                  data.avgPnlPerMood[a] < data.avgPnlPerMood[b] ? a : b
                )} mode
              </p>
            )}
          </div>
        )}

        {activeTab === "overview" ? (
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood vs P&L Chart */}
          <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
            <h2 className="text-xl font-semibold text-white mb-4">Mood vs P&L Correlation</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mood" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="avgPnl" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mood Heatmap */}
          <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
            <h2 className="text-xl font-semibold text-white mb-4">Mood History Heatmap</h2>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="font-semibold text-slate-400 py-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((item, index) => (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center rounded ${
                    item
                      ? item.mood
                        ? `${moodColors[item.mood]} text-white`
                        : "bg-slate-700 text-slate-400"
                      : "bg-transparent"
                  }`}
                >
                  {item?.day}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {moods.map((mood) => (
                <div key={mood} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${moodColors[mood]}`}></div>
                  <span>{mood}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
              <h2 className="mb-4 text-xl font-semibold text-white">Emotional State vs Trade Outcome</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={patternTrades}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="x" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                    labelStyle={{ color: "#F3F4F6" }}
                  />
                  <Bar dataKey="pnl">
                    {patternTrades.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={patternColorMap[(entry.mood || "").toLowerCase()] || "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)] space-y-2 text-slate-200">
              <p>Your calm trades have <span className="font-semibold text-blue-300">{calmWinRate.toFixed(1)}%</span> win rate.</p>
              <p>You tend to lose when Impulsive in <span className="font-semibold text-orange-300">{impulsiveLosses}/{Math.max(1, impulsiveTrades.length)}</span> trades.</p>
              <p><span className="font-semibold text-emerald-300">{planFollowPct.toFixed(1)}%</span> of your trades follow your plan.</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}