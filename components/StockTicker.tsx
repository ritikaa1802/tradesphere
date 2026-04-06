"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

// Mock initial data
const INITIAL_STOCKS = [
  { symbol: "RELIANCE", price: 2892.50, change: 1.2, isTopGainer: true },
  { symbol: "TCS", price: 3441.20, change: 0.8 },
  { symbol: "HDFCBANK", price: 1654.10, change: -0.4 },
  { symbol: "INFY", price: 1521.80, change: 2.1, isTopGainer: true },
  { symbol: "ICICIBANK", price: 1082.90, change: -1.1 },
  { symbol: "SBIN", price: 748.50, change: 0.5 },
  { symbol: "BHARTIARTL", price: 1215.30, change: 1.5, isTopGainer: true },
  { symbol: "ITC", price: 422.60, change: -0.2 },
  { symbol: "LT", price: 3412.00, change: 1.4 },
  { symbol: "BAJFINANCE", price: 6850.50, change: -2.3 },
  { symbol: "ASIANPAINT", price: 2890.10, change: 0.3 },
  { symbol: "MARUTI", price: 10540.20, change: -1.5 },
];

export default function StockTicker() {
  const [stocks, setStocks] = useState(INITIAL_STOCKS);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((current) =>
        current.map((stock) => {
          // 40% chance of updating a stock per tick
          if (Math.random() > 0.4) return stock;

          const changePercent = (Math.random() * 0.4 - 0.2); // +/- 0.2% change max
          const changeAmount = stock.price * (changePercent / 100);
          const newPrice = stock.price + changeAmount;
          const newChange = stock.change + changePercent;

          return {
            ...stock,
            price: newPrice,
            change: newChange,
            flash: changeAmount > 0 ? "up" : "down"
          };
        })
      );

      // We clear the flash effect after brief moment
      setTimeout(() => {
        setStocks((current) => current.map(s => ({ ...s, flash: undefined })));
      }, 500);

    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-r from-[#050912]/95 via-[#0A1020]/95 to-[#050912]/95 border-b border-white/5 backdrop-blur-xl h-11 flex items-center">
      {/* Dynamic CSS for the marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .flash-up {
          background-color: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
        }
        .flash-down {
          background-color: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
        }
      `}} />

      {/* Left fade gradient for seam masking */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050912] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee">
        {/* We output two identical sets of stocks to create a seamless infinite loop */}
        {[1, 2].map((set) => (
          <div key={set} className="flex items-center flex-nowrap pr-8">
            {stocks.map((stock, i) => {
              const isPositive = stock.change >= 0;
              return (
                <div 
                  key={`${stock.symbol}-${i}`}
                  className={`flex items-center gap-3 px-5 py-1.5 mx-2 rounded-full cursor-pointer transition-all duration-300 border border-transparent 
                    hover:bg-white/5 hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]
                    ${stock.flash === 'up' ? 'flash-up' : stock.flash === 'down' ? 'flash-down' : ''}
                  `}
                  title={`${stock.symbol} Detailed View`}
                >
                  <span className="text-xs font-bold text-slate-300 tracking-wide flex items-center gap-1.5">
                    {stock.isTopGainer && <Sparkles size={11} className="text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />}
                    {stock.symbol}
                  </span>
                  
                  <span className="text-[13px] font-semibold text-white tracking-tight tabular-nums">
                    ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  
                  <span className={`flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-sm transition-colors
                    ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}
                  `}>
                    {isPositive ? <TrendingUp size={11} className="mr-1" /> : <TrendingDown size={11} className="mr-1" />}
                    {Math.abs(stock.change).toFixed(2)}%
                  </span>

                  {/* Micro sparkline */}
                  <svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 ml-1 hidden sm:block">
                    <path 
                      d={isPositive ? "M0 10 Q 8 8, 12 6 T 24 4 T 32 1" : "M0 2 Q 8 4, 12 6 T 24 8 T 32 11"} 
                      stroke={isPositive ? "#10b981" : "#e11d48"} 
                      strokeWidth="1.2" 
                      strokeLinecap="round" 
                      fill="none" 
                    />
                    {isPositive && <circle cx="32" cy="1" r="1.5" fill="#10b981" className="animate-pulse" />}
                    {!isPositive && <circle cx="32" cy="11" r="1.5" fill="#e11d48" className="animate-pulse" />}
                  </svg>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Right fade gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050912] to-transparent z-10 pointer-events-none" />
    </div>
  );
}
