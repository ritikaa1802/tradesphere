"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type Time,
} from "lightweight-charts";

interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function TradeCandlestickChart({ candles }: { candles: CandlePoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0b1220" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "#1a2744" },
        horzLines: { color: "#1a2744" },
      },
      rightPriceScale: {
        borderColor: "#1a2744",
      },
      timeScale: {
        borderColor: "#1a2744",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "#3b82f6" },
        horzLine: { color: "#3b82f6" },
      },
      height: 350,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    series.setData(
      candles.map((candle) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })) as CandlestickData<Time>[],
    );

    chart.timeScale().fitContent();

    const onResize = () => {
      if (!containerRef.current) {
        return;
      }
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, [candles]);

  return <div ref={containerRef} className="h-[350px] w-full" />;
}
