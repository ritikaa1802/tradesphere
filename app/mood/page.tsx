"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MoodData {
  moodFrequency: Record<string, number>;
  avgPnlPerMood: Record<string, number>;
  moodPerDay: Record<string, string>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    } catch (err) {
      setError("Failed to load mood data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl p-6">
        <div className="w-full">
          <h1 className="mb-4 text-3xl font-bold">TradeMind</h1>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl p-6">
        <div className="w-full">
          <h1 className="mb-4 text-3xl font-bold">TradeMind</h1>
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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl p-6">
      <div className="w-full">
        <h1 className="mb-4 text-3xl font-bold">TradeMind</h1>

        {bestMood && (
          <div className="mb-6 rounded bg-slate-800 p-4">
            <p className="text-lg">
              You trade best when <span className="font-bold text-green-400">{bestMood}</span>
            </p>
            {Object.keys(data.avgPnlPerMood).length > 1 && (
              <p className="mt-2 text-sm text-slate-400">
                Your worst trades happen when you're in{" "}
                {Object.keys(data.avgPnlPerMood).reduce((a, b) =>
                  data.avgPnlPerMood[a] < data.avgPnlPerMood[b] ? a : b
                )} mode
              </p>
            )}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood vs P&L Chart */}
          <div className="rounded bg-slate-800 p-4">
            <h2 className="text-xl font-bold mb-4">Mood vs P&L Correlation</h2>
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
          <div className="rounded bg-slate-800 p-4">
            <h2 className="text-xl font-bold mb-4">Mood History Heatmap</h2>
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

        <div className="mt-4">
          <Link href="/dashboard" className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}