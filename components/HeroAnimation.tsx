"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function HeroAnimation() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const deviceRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!deviceRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      deviceRef.current.style.transform = `
        rotateX(${-dy * 8}deg) rotateY(${dx * 12}deg) translateZ(30px)
        ${phase >= 3 ? "translateY(0)" : ""}
      `;
      if (glowRef.current) {
        glowRef.current.style.backgroundPosition = `${50 + dx * 15}% ${50 + dy * 15}%`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [phase]);

  // Animation timeline
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);   // Phase 1: slide in
    const t2 = setTimeout(() => setPhase(2), 1300);  // Phase 2: stabilize + float
    const t3 = setTimeout(() => setPhase(3), 2000);  // Phase 3: layout transition
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] w-full overflow-hidden flex items-center"
      style={{ perspective: "1200px" }}
    >
      {/* ── Background layer ── */}
      <div className="absolute inset-0 bg-[#050912]" />

      {/* Animated gradient orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #1d4ed8 0%, #0ea5e9 40%, transparent 70%)",
          animation: "orbDrift 12s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, #3b82f6 50%, transparent 70%)",
          animation: "orbDrift 16s ease-in-out infinite alternate-reverse",
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')" }}
      />

      {/* ── Main content wrapper ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[80vh] gap-8 lg:gap-16">

          {/* ── LEFT: Text content (fades in during phase 3) ── */}
          <div
            className="flex-1 max-w-xl"
            style={{
              opacity: phase >= 3 ? 1 : 0,
              transform: phase >= 3 ? "translateX(0) translateY(0)" : "translateX(-40px) translateY(20px)",
              transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: phase >= 3 ? "0.1s" : "0s",
            }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-600/10 px-4 py-1.5 text-xs font-medium text-blue-400 mb-6 backdrop-blur"
              style={{
                opacity: phase >= 3 ? 1 : 0,
                transition: "opacity 0.6s ease",
                transitionDelay: "0.2s",
                boxShadow: "0 0 20px rgba(59,130,246,0.15)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              India&apos;s #1 AI Trading Platform
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-6xl">
              Trade{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #38bdf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Smarter.
              </span>
              <br />
              Learn{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #34d399 0%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Faster.
              </span>
              <br />
              Lose Less.
            </h1>

            {/* Sub */}
            <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
              India&apos;s only paper trading platform with <strong className="text-slate-200">AI behavioral coaching</strong>,
              emotion tracking, and personalized mistake detection. Built for serious traders.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  boxShadow: "0 0 30px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 0 50px rgba(37,99,235,0.8), 0 4px 20px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.2)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 0 30px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <span className="relative z-10">Start Trading Free</span>
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                />
                <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:border-blue-500/40 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
              >
                See How It Works
                <svg className="h-4 w-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Stats row */}
            <div
              className="mt-12 flex items-center gap-6 divide-x divide-white/10"
              style={{
                opacity: phase >= 3 ? 1 : 0,
                transition: "opacity 0.8s ease",
                transitionDelay: "0.5s",
              }}
            >
              {[
                { value: "₹1L+", label: "Virtual Capital" },
                { value: "10K+", label: "Traders" },
                { value: "98%", label: "Uptime" },
              ].map((s, i) => (
                <div key={i} className={i > 0 ? "pl-6" : ""}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Device Mockup ── */}
          <div
            className="relative flex-1 flex items-center justify-center"
            style={{
              minHeight: "480px",
              // Phase 0 → 1: offscreen right
              // Phase 1: slide in
              // Phase 3: settle into right column position
              opacity: phase === 0 ? 0 : 1,
              transform: phase === 0
                ? "translateX(120%) scale(0.88)"
                : phase === 1
                ? "translateX(0) scale(1)"
                : "translateX(0) scale(1)",
              transition:
                phase === 1
                  ? "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 1.0s cubic-bezier(0.22,1,0.36,1)"
                  : "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            {/* Glow behind device */}
            <div
              ref={glowRef}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.35) 0%, rgba(124,58,237,0.15) 40%, transparent 70%)",
                filter: "blur(40px)",
                opacity: phase >= 1 ? 1 : 0,
                transition: "opacity 1.2s ease",
                animation: phase >= 2 ? "glowPulse 3s ease-in-out infinite" : "none",
              }}
            />

            {/* 3D Device wrapper */}
            <div
              ref={deviceRef}
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                animation: phase >= 2 ? "deviceFloat 5s ease-in-out infinite" : "none",
                transition: "transform 0.12s ease-out",
              }}
            >
              {/* Screen frame */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: "min(580px, 90vw)",
                  aspectRatio: "16/10",
                  background: "linear-gradient(145deg, #0f1929, #0a1020)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  boxShadow: `
                    0 0 0 1px rgba(255,255,255,0.05),
                    0 30px 80px rgba(0,0,0,0.8),
                    0 0 80px rgba(37,99,235,0.2),
                    inset 0 1px 0 rgba(255,255,255,0.08)
                  `,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Glare reflection */}
                <div
                  className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
                />
                <div
                  className="absolute top-0 left-0 w-1/2 h-1/3 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
                    borderRadius: "inherit",
                  }}
                />

                {/* Dashboard UI inside frame */}
                <TradingDashboardMockup />
              </div>

              {/* Reflection under device */}
              <div
                className="absolute left-8 right-8 h-20 pointer-events-none"
                style={{
                  bottom: "-30px",
                  background: "linear-gradient(to bottom, rgba(37,99,235,0.12), transparent)",
                  filter: "blur(20px)",
                  transform: "scaleY(-1) translateZ(-10px)",
                  opacity: 0.6,
                }}
              />

              {/* Floating data badges */}
              <FloatingBadge
                style={{ top: "-28px", right: "32px", animationDelay: "0.3s" }}
                color="#22c55e"
                label="NIFTY 50"
                value="+2.4%"
                icon="▲"
              />
              <FloatingBadge
                style={{ bottom: "16px", left: "-24px", animationDelay: "0.8s" }}
                color="#3b82f6"
                label="Portfolio"
                value="₹1,04,820"
                icon="📈"
              />
              <FloatingBadge
                style={{ bottom: "48px", right: "-20px", animationDelay: "1.2s" }}
                color="#a78bfa"
                label="AI Score"
                value="87 / 100"
                icon="🧠"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #050912)" }}
      />

      <style>{`
        @keyframes deviceFloat {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-12px) rotateX(1.5deg); }
        }
        @keyframes orbDrift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(4%, 6%) scale(1.1); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}

// ── Trading Dashboard Mockup (drawn in pure JSX/CSS) ──────────────────────────
function TradingDashboardMockup() {
  return (
    <div className="w-full h-full relative overflow-hidden font-mono" style={{ background: "#080e1c", fontSize: "10px" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: "rgba(15,25,45,0.95)", borderBottom: "1px solid rgba(59,130,246,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-slate-400 ml-2 text-[9px]">TradeSphere Terminal</span>
        </div>
        <div className="flex items-center gap-4 text-[9px]">
          <span className="text-green-400">NSE ▲ 0.82%</span>
          <span className="text-red-400">BSE ▼ 0.21%</span>
          <span className="text-slate-500">LIVE</span>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div
          className="flex flex-col gap-1 pt-2 px-1"
          style={{ width: "44px", background: "rgba(10,16,28,0.9)", borderRight: "1px solid rgba(59,130,246,0.1)" }}
        >
          {["📊","📈","🧠","🏆","⚙️"].map((icon, i) => (
            <div key={i} className={`flex items-center justify-center h-7 w-7 rounded-lg text-sm cursor-pointer transition-all ${i === 0 ? "bg-blue-600/30 text-blue-400" : "text-slate-600 hover:text-slate-400"}`}>
              {icon}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Ticker bar */}
          <div
            className="flex items-center gap-4 px-3 py-1.5 text-[9px] overflow-hidden"
            style={{ borderBottom: "1px solid rgba(59,130,246,0.08)" }}
          >
            {[
              { name: "RELIANCE", price: "2,892", chg: "+1.2%", up: true },
              { name: "TCS", price: "3,441", chg: "+0.8%", up: true },
              { name: "HDFC", price: "1,654", chg: "-0.4%", up: false },
              { name: "INFY", price: "1,521", chg: "+2.1%", up: true },
            ].map((s) => (
              <div key={s.name} className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-slate-500">{s.name}</span>
                <span className="text-slate-200">₹{s.price}</span>
                <span className={s.up ? "text-green-400" : "text-red-400"}>{s.chg}</span>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1 relative px-3 pt-2 pb-1">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-slate-200 font-bold text-xs">NIFTY 50</span>
                <span className="text-green-400 ml-2 text-[9px]">22,890.45 ▲</span>
              </div>
              <div className="flex gap-1">
                {["1D","1W","1M","1Y"].map((t,i) => (
                  <button key={t} className={`px-1.5 py-0.5 rounded text-[8px] ${i === 0 ? "bg-blue-600 text-white" : "text-slate-500"}`}>{t}</button>
                ))}
              </div>
            </div>

            {/* SVG Candlestick Chart */}
            <svg viewBox="0 0 520 160" className="w-full" style={{ height: "120px" }}>
              {/* Grid lines */}
              {[0,40,80,120,160].map(y => (
                <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
              ))}
              {/* Area gradient under the line */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path
                d="M0,120 L30,110 L60,95 L90,100 L120,85 L150,90 L180,75 L210,65 L240,80 L270,55 L300,48 L330,60 L360,42 L390,35 L420,28 L450,38 L480,22 L510,15 L520,15 L520,160 L0,160"
                fill="url(#chartGrad)"
              />
              {/* Main line */}
              <path
                d="M0,120 L30,110 L60,95 L90,100 L120,85 L150,90 L180,75 L210,65 L240,80 L270,55 L300,48 L330,60 L360,42 L390,35 L420,28 L450,38 L480,22 L510,15"
                fill="none" stroke="#3b82f6" strokeWidth="2"
                style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.6))" }}
              />
              {/* Candles */}
              {[
                [50,88,78,92],[100,82,70,88],[150,85,75,90],[200,60,50,68],
                [250,50,40,58],[300,44,38,52],[350,38,30,45],[400,30,22,36],[450,34,26,40],[500,18,12,24]
              ].map(([x,high,low,close], i) => (
                <g key={i}>
                  <line x1={x} y1={high} x2={x} y2={low} stroke={close < high ? "#22c55e" : "#ef4444"} strokeWidth="1"/>
                  <rect x={x-4} y={Math.min(high, close)} width="8" height={Math.abs(high-close)||2}
                    fill={close < high ? "#22c55e" : "#ef4444"} fillOpacity="0.8"/>
                </g>
              ))}
              {/* Cursor line */}
              <line x1="390" y1="0" x2="390" y2="160" stroke="rgba(59,130,246,0.5)" strokeWidth="1" strokeDasharray="3,3"/>
              <circle cx="390" cy="35" r="4" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 6px #3b82f6)" }}/>
            </svg>
          </div>

          {/* Bottom data strip */}
          <div
            className="grid grid-cols-4 gap-0 px-3 py-2 text-[8px]"
            style={{ borderTop: "1px solid rgba(59,130,246,0.08)" }}
          >
            {[
              { label: "P&L Today", value: "+₹2,840", color: "#22c55e" },
              { label: "Win Rate", value: "68%", color: "#60a5fa" },
              { label: "Trades", value: "24", color: "#e2e8f0" },
              { label: "AI Score", value: "87", color: "#a78bfa" },
            ].map((d) => (
              <div key={d.label} className="text-center">
                <div style={{ color: d.color, fontWeight: 700, fontSize: "10px" }}>{d.value}</div>
                <div className="text-slate-600 mt-0.5">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small floating info badges ────────────────────────────────────────────────
function FloatingBadge({
  style,
  color,
  label,
  value,
  icon,
}: {
  style: React.CSSProperties;
  color: string;
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div
      className="absolute flex items-center gap-2 rounded-xl backdrop-blur-md px-3 py-2 text-xs font-semibold"
      style={{
        ...style,
        background: "rgba(8,14,28,0.85)",
        border: `1px solid ${color}30`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 12px ${color}20`,
        animation: "badgeFloat 4s ease-in-out infinite",
        whiteSpace: "nowrap",
      }}
    >
      <span>{icon}</span>
      <div>
        <div className="text-slate-400 text-[9px]">{label}</div>
        <div style={{ color }} className="font-bold">{value}</div>
      </div>
    </div>
  );
}
