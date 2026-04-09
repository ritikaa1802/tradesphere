"use client";

import { useEffect, useMemo, useState } from "react";

const NEWS_TEMPLATES = [
  "{stock} reports weak quarterly earnings",
  "RBI raises interest rates unexpectedly",
  "FII selling pressure increases on {stock}",
  "Sensex drops 500 points on global cues",
  "{stock} announces major acquisition",
];

function getIstNow(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

function getMarketWindow(istNow: Date) {
  const open = new Date(istNow);
  open.setHours(9, 15, 0, 0);
  const close = new Date(istNow);
  close.setHours(15, 30, 0, 0);
  return { open, close };
}

function msToClock(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

export default function PressureSimulation({
  symbol,
  currentPrice,
  openPrice,
}: {
  symbol: string;
  currentPrice: number;
  openPrice: number;
}) {
  const [clockNow, setClockNow] = useState<Date>(getIstNow());
  const [breakingNews, setBreakingNews] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setClockNow(getIstNow()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNews = () => {
      const delay = (120 + Math.floor(Math.random() * 61)) * 1000;
      timeoutId = setTimeout(() => {
        const template = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
        setBreakingNews(template.replaceAll("{stock}", symbol));
        scheduleNews();
      }, delay);
    };

    scheduleNews();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [symbol]);

  const { open, close } = useMemo(() => getMarketWindow(clockNow), [clockNow]);
  const isBeforeOpen = clockNow < open;
  const isAfterClose = clockNow > close;
  const closeCountdown = isAfterClose ? 0 : close.getTime() - clockNow.getTime();
  const openCountdown = isBeforeOpen ? open.getTime() - clockNow.getTime() : 0;
  const urgent = !isBeforeOpen && !isAfterClose && closeCountdown <= 30 * 60 * 1000;

  const volatilityPercent = openPrice > 0 ? ((currentPrice - openPrice) / openPrice) * 100 : 0;
  const showVolatilitySpike = Math.abs(volatilityPercent) > 2;

  return (
    <div className="mb-4 space-y-2">
      {breakingNews ? (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <p>⚠ Breaking News: {breakingNews}</p>
          <button
            type="button"
            onClick={() => setBreakingNews(null)}
            className="shrink-0 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-100 hover:bg-amber-500/30"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {showVolatilitySpike ? (
        <div className="animate-pulse rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200">
          ⚡ Volatility Spike Detected!
        </div>
      ) : null}

      <div
        className={`rounded-lg border px-3 py-2 text-sm ${
          urgent ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-blue-500/40 bg-blue-500/10 text-blue-200"
        }`}
      >
        {isBeforeOpen
          ? `Market opens in ${msToClock(openCountdown)} hours`
          : isAfterClose
            ? "Market closed for the day"
            : `Market closes in ${msToClock(closeCountdown)} hours`}
      </div>
    </div>
  );
}
