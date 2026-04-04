"use client";

import { useEffect, useRef } from "react";
import {
  ColorType,
  createChart,
  HistogramSeries,
  CandlestickSeries,
  type CandlestickData,
  type HistogramData,
  type Time,
} from "lightweight-charts";

interface StockChartClientProps {
  candles: Array<{ time: number; open: number; high: number; low: number; close: number }>;
  volumes: Array<{ time: number; value: number; color: string }>;
}

export default function StockChartClient({ candles, volumes }: StockChartClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0d1421" },
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
      height: 420,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candlestickSeries.setData(
      candles.map((candle) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })) as CandlestickData<Time>[],
    );

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
      color: "#3b82f6",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.75,
        bottom: 0,
      },
    });

    volumeSeries.setData(
      volumes.map((volume) => ({
        time: volume.time as Time,
        value: volume.value,
        color: volume.color,
      })) as HistogramData<Time>[],
    );

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (!containerRef.current) {
        return;
      }
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candles, volumes]);

  return <div ref={containerRef} className="w-full" />;
}
