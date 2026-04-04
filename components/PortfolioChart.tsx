"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Trade {
  id: string;
  type: "buy" | "sell";
  price: number;
  quantity: number;
  charges: number;
  createdAt: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildChartData(trades: Trade[], currentValue: number) {
  if (!trades.length) {
    return [
      { date: "Today", value: Math.max(0, currentValue) },
      { date: "7d ago", value: Math.max(0, currentValue - 1200) },
    ].reverse();
  }

  const dailyNet = new Map<string, number>();

  trades
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach((trade) => {
      const day = new Date(trade.createdAt).toISOString().slice(0, 10);
      const impact = (trade.type === "sell" ? 1 : -1) * (trade.price * trade.quantity - trade.charges);
      dailyNet.set(day, (dailyNet.get(day) ?? 0) + impact);
    });

  const sortedDays = Array.from(dailyNet.entries()).sort(([a], [b]) => a.localeCompare(b));
  let runningValue = currentValue;
  const points: { date: string; value: number }[] = [];

  for (let i = sortedDays.length - 1; i >= 0; i -= 1) {
    const [day, amount] = sortedDays[i];
    points.unshift({ date: formatDate(day), value: Math.max(0, runningValue) });
    runningValue -= amount;
  }

  if (points.length === 1) {
    points.unshift({ date: "Earlier", value: Math.max(0, points[0].value - 900) });
  }

  return points;
}

export default function PortfolioChart({ currentValue }: { currentValue: number }) {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/trades");
        if (!res.ok) throw new Error("Failed to load trades");
        const trades: Trade[] = await res.json();
        setData(buildChartData(trades, currentValue));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentValue]);

  if (loading) {
    return <p className="text-slate-400">Loading portfolio trend...</p>;
  }

  if (error) {
    return <p className="text-rose-400">{error}</p>;
  }

  return (
    <div className="h-[320px] w-full rounded-3xl bg-[#0f1629] border border-slate-800 p-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.8)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Portfolio value over time</p>
          <p className="text-2xl font-semibold text-white">₹{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f1629", border: "1px solid #334155" }}
            labelStyle={{ color: "#f8fafc" }}
            formatter={(value) => {
              const numberValue = typeof value === "number" ? value : Number(value || 0);
              return [`₹${numberValue.toFixed(2)}`, "Value"];
            }}
          />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
