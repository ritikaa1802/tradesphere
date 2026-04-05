"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart2,
  Brain,
  Database,
  Globe,
  MonitorPlay,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";

const FlowNode = ({
  icon: Icon,
  title,
  desc,
  gradientClass,
  delay,
  children,
}: {
  icon: any;
  title: string;
  desc: string;
  gradientClass: string;
  delay: number;
  children?: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="relative flex h-full flex-col items-center justify-center rounded-xl border border-[#1a2744] bg-[#050912]/80 p-5 pt-8 text-center shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-[#3b82f6]/50 lg:w-48 xl:w-56"
  >
    {/* Floating top icon circle */}
    <div
      className={`absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#060b14] shadow-[0_0_15px_rgba(0,0,0,0.5)] ${gradientClass}`}
    >
      <Icon size={18} className="text-white" />
    </div>

    {/* Content */}
    <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-white lg:text-sm">{title}</h3>
    <p className="text-[10px] leading-relaxed text-[#9ca3af] lg:text-xs">{desc}</p>

    {/* Hover glow effect */}
    <div className={`pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${gradientClass}`} />
    
    {children}
  </motion.div>
);

const Connector = ({
  direction,
  gradient,
  animated = true,
}: {
  direction: "right" | "down" | "dashed-up-right";
  gradient: string;
  animated?: boolean;
}) => {
  if (direction === "right") {
    return (
      <div className="absolute -right-8 top-1/2 z-0 h-[2px] w-8 -translate-y-1/2 lg:w-10 lg:-right-10 xl:w-12 xl:-right-12">
        <div className={`h-full w-full ${gradient}`} />
        {animated && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "200%", opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 bg-white/40 blur-[2px]"
          />
        )}
        <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-white/40" />
      </div>
    );
  }

  if (direction === "down") {
    return (
      <div className="absolute -bottom-8 left-1/2 z-0 h-8 w-[2px] -translate-x-1/2 lg:h-12 lg:-bottom-12 xl:h-16 xl:-bottom-16">
        <div className={`h-full w-full ${gradient}`} />
        {animated && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "200%", opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "linear" }}
            className="absolute inset-0 bg-white/40 blur-[2px]"
          />
        )}
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white/40" />
      </div>
    );
  }
  
  if (direction === "dashed-up-right") {
    return (
      <svg
        className="pointer-events-none absolute -right-[4.5rem] bottom-1/2 z-0 h-[100px] w-[120px] translate-y-1/2 md:h-[120px] md:w-[150px] lg:-right-[6.5rem]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 0,100 C 50,100 50,0 120,0"
          stroke="url(#dash-gradient)"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="opacity-50"
        />
        <defs>
          <linearGradient id="dash-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return null;
};

export default function SystemFlow() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <section className="relative overflow-hidden bg-[#020408] py-24 text-white">
      {/* Deep space background texture/noise */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a2744]/20 via-[#020408] to-[#020408]" />
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-3 py-1 text-xs font-semibold text-[#60a5fa] backdrop-blur-md"
          >
            <Brain size={14} /> AI-Powered Trading Pipeline
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-white to-[#9ca3af] bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl lg:text-5xl"
          >
            Everything you need to become a better trader
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-base text-[#9ca3af] sm:text-lg"
          >
            From raw execution to personalized coaching, experience the first fully connected platform designed to fix your trading psychology.
          </motion.p>
        </div>

        {/* Dynamic Pipeline Layout (Desktop Grid / Mobile Stack) */}
        <div className="hidden lg:grid grid-cols-5 gap-x-10 xl:gap-x-12 gap-y-16 py-10 relative">
          
          {/* Top Row: External Feeds */}
          <div className="col-start-3 row-start-1 relative z-10">
            <FlowNode
              icon={Globe}
              title="Live Market Data"
              desc="Real NSE & BSE prices streamed with full candlestick charts and volume."
              gradientClass="bg-gradient-to-br from-teal-400 to-emerald-600"
              delay={0.1}
            >
              <Connector direction="down" gradient="bg-gradient-to-b from-teal-500 to-purple-500" animated />
            </FlowNode>
          </div>

          {/* Middle Row: Main Pipeline */}
          <div className="col-start-1 row-start-2 relative z-10">
            <FlowNode
              icon={MonitorPlay}
              title="Trader Actions"
              desc="Execute trades instantly across a virtual live-execution environment."
              gradientClass="bg-gradient-to-br from-blue-500 to-cyan-500"
              delay={0.2}
            >
              <Connector direction="right" gradient="bg-gradient-to-r from-blue-500 to-indigo-500" animated />
            </FlowNode>
          </div>

          <div className="col-start-2 row-start-2 relative z-10">
            <FlowNode
              icon={Activity}
              title="Emotion Journal"
              desc="Log your mood and mental state before every entry and exit."
              gradientClass="bg-gradient-to-br from-indigo-500 to-purple-500"
              delay={0.3}
            >
              <Connector direction="right" gradient="bg-gradient-to-r from-indigo-500 to-purple-500" animated />
            </FlowNode>
          </div>

          {/* Center Engine Node */}
          <div className="col-start-3 row-start-2 relative z-20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
              whileInView={{ scale: 1, opacity: 1, boxShadow: "0 0 40px rgba(139,92,246,0.3)" }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring" }}
              className="relative flex h-full flex-col items-center justify-center rounded-xl border border-purple-500/50 bg-[#0d0a1a] p-5 pt-8 text-center backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-purple-400 lg:w-48 xl:w-56"
            >
              <div className="absolute -top-5 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#060b14] shadow-[0_0_20px_rgba(139,92,246,0.5)] bg-gradient-to-br from-purple-500 to-pink-500">
                <Brain size={22} className="text-white animate-pulse" />
              </div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Mistake Detector</h3>
              <p className="text-[10px] leading-relaxed text-[#9ca3af] lg:text-xs">
                AI continuously analyzes execution speed, mood, and market data to detect FOMO, panic, or revenge trading.
              </p>
              
              <Connector direction="right" gradient="bg-gradient-to-r from-pink-500 to-orange-500" animated />
              <Connector direction="down" gradient="bg-gradient-to-b from-purple-500 to-[#0a0f1a]" animated={false} />
            </motion.div>
          </div>

          <div className="col-start-4 row-start-2 relative z-10">
            <FlowNode
              icon={BarChart2}
              title="AI Behavioral Coach"
              desc="Generates personalized weekly reports mapping emotions to actual P&L."
              gradientClass="bg-gradient-to-br from-orange-400 to-amber-500"
              delay={0.5}
            >
              <Connector direction="right" gradient="bg-gradient-to-r from-orange-500 to-rose-500" animated />
            </FlowNode>
          </div>

          <div className="col-start-5 row-start-2 relative z-10">
            <FlowNode
              icon={Trophy}
              title="Skill Refinement"
              desc="Deploy refined logic in weekly skill-based competitions."
              gradientClass="bg-gradient-to-br from-rose-500 to-pink-600"
              delay={0.6}
            />
          </div>

          {/* Bottom Row: Event Store */}
          <div className="col-start-3 row-start-3 relative z-0">
            <FlowNode
              icon={Database}
              title="Deep Analytics"
              desc="Historical event store tracking win rates, streaks, and risk scores."
              gradientClass="bg-[#1a2744]"
              delay={0.7}
            >
               <Connector direction="dashed-up-right" gradient="" animated={false} />
            </FlowNode>
          </div>
        </div>

        {/* Mobile / Tablet View (Vertical Stack) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:hidden">
            <FlowNode icon={MonitorPlay} title="Trader Actions" desc="Execute trades instantly across a virtual live-execution environment." gradientClass="bg-gradient-to-br from-blue-500 to-cyan-500" delay={0.1} />
            <FlowNode icon={Activity} title="Emotion Journal" desc="Log your mood and mental state before every entry and exit." gradientClass="bg-gradient-to-br from-indigo-500 to-purple-500" delay={0.2} />
            <FlowNode icon={Globe} title="Live Market Data" desc="Real NSE & BSE prices streamed with full candlestick charts and volume." gradientClass="bg-gradient-to-br from-teal-400 to-emerald-600" delay={0.3} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative flex h-full flex-col items-center justify-center rounded-xl border border-purple-500/50 bg-[#0d0a1a] p-5 pt-8 text-center sm:col-span-2"
            >
              <div className="absolute -top-5 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#060b14] bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                <Brain size={22} className="text-white" />
              </div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Mistake Detector (AI Engine)</h3>
              <p className="text-xs leading-relaxed text-[#9ca3af]">
                Continuously analyzes execution speed, mood, and market data to detect FOMO, panic, or revenge trading.
              </p>
            </motion.div>
            <FlowNode icon={BarChart2} title="AI Behavioral Coach" desc="Generates personalized weekly reports mapping emotions to actual P&L." gradientClass="bg-gradient-to-br from-orange-400 to-amber-500" delay={0.4} />
            <FlowNode icon={Trophy} title="Skill Refinement" desc="Deploy refined logic in weekly skill-based competitions." gradientClass="bg-gradient-to-br from-rose-500 to-pink-600" delay={0.5} />
            <FlowNode icon={Database} title="Deep Analytics" desc="Historical event store tracking win rates, streaks, and risk scores." gradientClass="bg-[#1a2744]" delay={0.6} />
        </div>

        {/* Legend / How It Works Bottom Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mx-auto mt-16 max-w-5xl rounded-xl border border-[#1a2744] bg-[#0d1421]/50 backdrop-blur-md p-4 lg:p-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center justify-between">
            <div className="flex items-center gap-4 lg:border-r border-[#1a2744] pr-6 shrink-0">
              <h4 className="text-sm border-l-4 border-blue-500 pl-3 font-semibold uppercase tracking-widest text-[#9ca3af]">
                How It Works
              </h4>
            </div>
            
            <div className="flex flex-col lg:flex-row flex-1 justify-around gap-4 text-xs xl:text-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3b82f6] text-[10px] font-bold text-[#3b82f6]">01</span>
                <span className="text-white">User trades & logs mood</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal-500 text-[10px] font-bold text-teal-400">02</span>
                <span className="text-white">Engine merges live data</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-purple-500 text-[10px] font-bold text-purple-400">03</span>
                <span className="text-white">Mistakes are detected</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-500 text-[10px] font-bold text-rose-400">04</span>
                <span className="text-white">AI Coach refines habits</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
