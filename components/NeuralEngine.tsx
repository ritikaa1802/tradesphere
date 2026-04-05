"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart2,
  Brain,
  Database,
  Globe,
  LineChart,
} from "lucide-react";

// The outer nodes data
const features = [
  { id: "market", title: "Live Market Data", desc: "Real NSE/BSE streaming", icon: Globe, angle: -90, color: "#06b6d4", shadow: "rgba(6,182,212,0.4)" },
  { id: "emotion", title: "Emotion Journal", desc: "Psychology & mood tracking", icon: Activity, angle: -18, color: "#8b5cf6", shadow: "rgba(139,92,246,0.4)" },
  { id: "analytics", title: "Deep Analytics", desc: "Win rates & risk profiles", icon: Database, angle: 54, color: "#3b82f6", shadow: "rgba(59,130,246,0.4)" },
  { id: "coach", title: "Coaching System", desc: "Actionable weekly insights", icon: BarChart2, angle: 126, color: "#f59e0b", shadow: "rgba(245,158,11,0.4)" },
  { id: "mistake", title: "Mistake Detection", desc: "FOMO & panic alerts", icon: LineChart, angle: 198, color: "#ec4899", shadow: "rgba(236,72,153,0.4)" },
];

const RADIUS = 280; // Desktop radius

export default function NeuralEngine() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Parallax logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 40; // max shift 20px
      const y = (e.clientY / innerHeight - 0.5) * 40;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative overflow-hidden bg-[#030712] py-24 sm:py-32">
      {/* Background depth layers */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1d4ed8]/10 via-[#030712] to-[#030712]" />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 lg:mb-24">
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-5xl">
            Powered by the <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">TradeSphere AI Engine</span>
          </h2>
          <p className="mt-4 text-base text-slate-400">
            A fully interconnected neural architecture that monitors every execution, detects psychological flaws, and trains your edge automatically.
          </p>
        </div>

        {/* ── Desktop Radial Layout ── */}
        <div className="hidden lg:flex relative h-[700px] w-full items-center justify-center">
          <motion.div
            style={{ x: smoothX, y: smoothY }}
            className="relative flex items-center justify-center h-full w-full max-w-[800px]"
          >
            {/* Connection Lines (Lines rotating outward from center) */}
            {features.map((feature, i) => {
              const rad = (feature.angle * Math.PI) / 180;
              const isHovered = hoveredNode === feature.id;
              const isAnyHovered = hoveredNode !== null;
              const isActive = !isAnyHovered || isHovered;

              return (
                <motion.div
                  key={`line-${feature.id}`}
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{ width: RADIUS - 40, opacity: isActive ? 1 : 0.2 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="absolute z-0 origin-left border-t border-dashed"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `rotate(${feature.angle}deg)`,
                    borderColor: isActive ? feature.color : "#1e293b",
                    boxShadow: isActive ? `0 -1px 10px ${feature.shadow}` : "none",
                  }}
                >
                  {/* Flowing particle along the line */}
                  {isActive && (
                    <motion.div
                      initial={{ left: 0, opacity: 0 }}
                      animate={{ left: "100%", opacity: [0, 1, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                      className="absolute -top-[2px] h-[3px] w-8 rounded-full bg-white blur-[1px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)` }}
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Center Brain Node */}
            <motion.div
              className="relative z-20 flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#030712]/80 backdrop-blur-xl border border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 0 80px rgba(59,130,246,0.6)" }}
              onHoverStart={() => setHoveredNode("center")}
              onHoverEnd={() => setHoveredNode(null)}
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse" />
              <Brain size={36} className="text-blue-400 mb-1" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center leading-tight">
                AI <br /> Engine
              </span>
            </motion.div>

            {/* Satellite Nodes */}
            {features.map((feature, i) => {
              const rad = (feature.angle * Math.PI) / 180;
              const isHovered = hoveredNode === feature.id || hoveredNode === "center";
              const isAnyHovered = hoveredNode !== null;
              const opacity = (!isAnyHovered || isHovered) ? 1 : 0.3;

              return (
                <motion.div
                  key={`node-${feature.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                  onHoverStart={() => setHoveredNode(feature.id)}
                  onHoverEnd={() => setHoveredNode(null)}
                  className="absolute z-10 flex w-48 flex-col items-center justify-center rounded-2xl bg-[#0a0f1a]/60 p-4 text-center backdrop-blur-md transition-all duration-300 hover:scale-110 cursor-default"
                  style={{
                    left: `calc(50% + ${Math.cos(rad) * RADIUS}px)`,
                    top: `calc(50% + ${Math.sin(rad) * RADIUS}px)`,
                    transform: "translate(-50%, -50%)",
                    border: `1px solid ${isHovered ? feature.color : "#1e293b"}`,
                    boxShadow: isHovered ? `0 0 25px ${feature.shadow}, inset 0 0 10px ${feature.shadow}` : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    opacity,
                  }}
                >
                  <div className="mb-3 rounded-full border border-slate-700 bg-[#030712] p-2"
                    style={{ borderColor: isHovered ? feature.color : "#334155", boxShadow: isHovered ? `0 0 15px ${feature.shadow}` : "none" }}>
                    <feature.icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">{feature.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ── Mobile Structured System Flow ── */}
        <div className="relative flex flex-col gap-8 lg:hidden mt-8 max-w-sm mx-auto">
          {/* Vertical connecting line */}
          <div className="absolute top-10 bottom-10 left-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-b from-blue-500/20 via-blue-500/50 to-purple-500/20" />
          
          {/* Center Brain at the top on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#030712]/90 backdrop-blur border border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-4"
          >
            <Brain size={32} className="text-blue-400 mb-1" />
            <span className="text-xs font-bold text-white uppercase tracking-widest text-center leading-tight">
              AI Component
            </span>
          </motion.div>

          {/* Staggered Zig-Zag nodes */}
          {features.map((feature, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={`mob-node-${feature.id}`}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className={`relative z-10 flex w-[85%] flex-col rounded-2xl bg-[#0a0f1a]/80 p-5 backdrop-blur-md border border-[#1e293b] ${
                  isLeft ? "mr-auto text-right items-end" : "ml-auto text-left items-start"
                }`}
                style={{
                  borderLeftColor: !isLeft ? feature.color : "#1e293b",
                  borderRightColor: isLeft ? feature.color : "#1e293b",
                }}
              >
                {/* Connection dot to center line */}
                <div className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#030712] ${isLeft ? "-right-9" : "-left-9"}`}
                  style={{ backgroundColor: feature.color, boxShadow: `0 0 10px ${feature.color}` }} />
                  
                <div className="mb-2 rounded-full border border-slate-700 bg-[#030712] p-2 inline-flex"
                  style={{ borderColor: feature.color }}>
                  <feature.icon size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase">{feature.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
