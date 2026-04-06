"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart2,
  Brain,
  Cpu,
  Globe,
  LineChart,
} from "lucide-react";

type Feature = {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  color: string;
  glow: string;
  desktopPos: { x: number; y: number };
  tabletPos: { x: number; y: number };
};

const features = [
  {
    id: "market",
    title: "Live Market Data",
    desc: "Real-time market pulse and liquidity streams.",
    icon: Globe,
    color: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.45)",
    desktopPos: { x: 20, y: 20 },
    tabletPos: { x: 14, y: 34 },
  },
  {
    id: "emotion",
    title: "Emotion Journal",
    desc: "Capture mindset shifts before and after entries.",
    icon: Activity,
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.45)",
    desktopPos: { x: 80, y: 18 },
    tabletPos: { x: 34, y: 16 },
  },
  {
    id: "analytics",
    title: "Deep Analytics",
    desc: "Pattern intelligence across risk and execution data.",
    icon: Cpu,
    color: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.45)",
    desktopPos: { x: 85, y: 58 },
    tabletPos: { x: 66, y: 16 },
  },
  {
    id: "coach",
    title: "Coaching System",
    desc: "Adaptive feedback loops that sharpen decision quality.",
    icon: BarChart2,
    color: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.45)",
    desktopPos: { x: 30, y: 83 },
    tabletPos: { x: 86, y: 34 },
  },
  {
    id: "mistake",
    title: "Mistake Detection",
    desc: "Flags recurring FOMO and impulse trading signatures.",
    icon: LineChart,
    color: "#818cf8",
    glow: "rgba(129, 140, 248, 0.45)",
    desktopPos: { x: 10, y: 58 },
    tabletPos: { x: 50, y: 44 },
  },
] satisfies Feature[];

type Ripple = { id: number; x: number; y: number };

function cardPath(feature: Feature, mode: "desktop" | "tablet") {
  const centerX = 50;
  const centerY = mode === "desktop" ? 50 : 48;
  const target = mode === "desktop" ? feature.desktopPos : feature.tabletPos;
  const controlX = centerX + (target.x - centerX) * 0.45 + (target.y > centerY ? -8 : 8);
  const controlY = centerY + (target.y - centerY) * 0.45;

  return `M ${centerX} ${centerY} Q ${controlX} ${controlY} ${target.x} ${target.y}`;
}

export default function NeuralEngine() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});
  const sectionRef = useRef<HTMLElement | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, active: false });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 18, mass: 0.8 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 18, mass: 0.8 });

  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: `${(index * 19.7) % 100}%`,
        top: `${(index * 11.3 + 9) % 100}%`,
        size: (index % 4) + 1,
        delay: (index % 10) * 0.35,
        duration: 8 + (index % 6) * 2,
      })),
    [],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const bounds = sectionRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const relativeX = e.clientX - bounds.left;
      const relativeY = e.clientY - bounds.top;
      const inside =
        relativeX >= 0 &&
        relativeY >= 0 &&
        relativeX <= bounds.width &&
        relativeY <= bounds.height;

      if (!inside) {
        setCursor((prev) => (prev.active ? { ...prev, active: false } : prev));
        mouseX.set(0);
        mouseY.set(0);
        return;
      }

      const x = (relativeX / bounds.width - 0.5) * 36;
      const y = (relativeY / bounds.height - 0.5) * 36;
      mouseX.set(x);
      mouseY.set(y);
      setCursor({ x: relativeX, y: relativeY, active: true });
    };

    const handleLeave = () => {
      setCursor((prev) => ({ ...prev, active: false }));
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    sectionRef.current?.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      sectionRef.current?.removeEventListener("mouseleave", handleLeave);
    };
  }, [mouseX, mouseY]);

  const spawnRipple = (featureId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const newRipple: Ripple = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setRipples((prev) => ({
      ...prev,
      [featureId]: [...(prev[featureId] ?? []), newRipple],
    }));

    window.setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [featureId]: (prev[featureId] ?? []).filter((r) => r.id !== newRipple.id),
      }));
    }, 650);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-28 lg:py-32"
      style={{
        background:
          "radial-gradient(95% 90% at 50% 48%, rgba(56,189,248,0.12), rgba(5,10,25,0) 55%), linear-gradient(140deg, #02050f 0%, #050b1c 45%, #110b26 100%)",
      }}
    >
      <div className="absolute inset-0 z-0 opacity-[0.3]" style={{
        backgroundImage:
          "radial-gradient(circle at 15% 20%, rgba(34,211,238,0.2), transparent 28%), radial-gradient(circle at 85% 18%, rgba(129,140,248,0.22), transparent 30%), radial-gradient(circle at 50% 75%, rgba(96,165,250,0.14), transparent 34%)",
      }} />

      <div
        className="absolute inset-0 z-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-0">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute rounded-full bg-cyan-300"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              opacity: 0.14,
              filter: "blur(0.5px)",
            }}
            animate={{ y: [0, -14, 0], opacity: [0.08, 0.22, 0.08] }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {cursor.active && (
        <motion.div
          className="pointer-events-none absolute z-[1] h-56 w-56 rounded-full"
          animate={{
            x: cursor.x - 112,
            y: cursor.y - 112,
            opacity: 1,
          }}
          initial={false}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            background:
              "radial-gradient(circle, rgba(96,165,250,0.24) 0%, rgba(56,189,248,0.1) 30%, rgba(56,189,248,0) 72%)",
            filter: "blur(12px)",
          }}
        />
      )}

      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.17), rgba(56,189,248,0) 45%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
          <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-cyan-200/70">Neural Intelligence Layer</p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            AI Neural Engine System
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300/90 sm:text-base">
            A living intelligence mesh that reads market signals, trader psychology, and execution behavior in one adaptive core.
          </p>
        </div>

        <div className="hidden lg:block">
          <motion.div
            style={{ x: smoothX, y: smoothY }}
            className="relative mx-auto h-[740px] w-full max-w-[1080px]"
          >
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {features.map((feature) => {
                const active = hoveredNode === feature.id || hoveredNode === null;
                return (
                  <g key={`desktop-path-${feature.id}`}>
                    <motion.path
                      d={cardPath(feature, "desktop")}
                      fill="none"
                      stroke={feature.color}
                      strokeWidth={active ? 0.3 : 0.2}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: active ? 0.6 : 0.2 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{ filter: active ? `drop-shadow(0 0 8px ${feature.glow})` : "none" }}
                    />
                    <motion.path
                      d={cardPath(feature, "desktop")}
                      fill="none"
                      stroke={feature.color}
                      strokeWidth={0.12}
                      strokeLinecap="round"
                      strokeDasharray="1.6 2.4"
                      animate={{ strokeDashoffset: [0, -12] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                      style={{ opacity: active ? 1 : 0.25 }}
                    />
                  </g>
                );
              })}
            </svg>

            <motion.div
              className="absolute left-1/2 top-1/2 z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "conic-gradient(from 120deg, rgba(34,211,238,0.24), rgba(99,102,241,0.22), rgba(59,130,246,0.18), rgba(34,211,238,0.24))",
                filter: "blur(24px)",
              }}
            />

            <motion.div
              className="absolute left-1/2 top-1/2 z-20 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-cyan-300/35 bg-slate-950/60 backdrop-blur-2xl"
              animate={{
                scale: [1, 1.04, 1],
                boxShadow: [
                  "0 0 32px rgba(56,189,248,0.25), inset 0 0 18px rgba(96,165,250,0.22)",
                  "0 0 58px rgba(56,189,248,0.45), inset 0 0 28px rgba(129,140,248,0.28)",
                  "0 0 32px rgba(56,189,248,0.25), inset 0 0 18px rgba(96,165,250,0.22)",
                ],
              }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-2 rounded-full border border-white/10"
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-5 rounded-full border border-cyan-200/20"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <Brain size={34} className="text-cyan-200" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">AI Engine</p>
            </motion.div>

            {features.map((feature, i) => {
              const isHovered = hoveredNode === feature.id;
              const Icon = feature.icon;
              const glowStrength =
                hoveredNode === null || isHovered
                  ? `0 10px 38px rgba(0,0,0,0.4), 0 0 26px ${feature.glow}`
                  : "0 8px 26px rgba(0,0,0,0.3)";

              return (
                <motion.button
                  key={`desktop-card-${feature.id}`}
                  type="button"
                  onMouseEnter={() => setHoveredNode(feature.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(event) => spawnRipple(feature.id, event)}
                  initial={{ opacity: 0, y: 18, scale: 0.92 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 0.18 + i * 0.08, ease: "easeOut" }}
                  whileHover={{ scale: 1.06, rotateX: -5, rotateY: 6, y: -4 }}
                  className="group absolute z-20 w-[238px] overflow-hidden rounded-2xl border bg-white/[0.07] p-5 text-left backdrop-blur-xl"
                  style={{
                    left: `${feature.desktopPos.x}%`,
                    top: `${feature.desktopPos.y}%`,
                    transform: "translate(-50%, -50%)",
                    borderColor:
                      hoveredNode === null || isHovered ? `${feature.color}55` : "rgba(148,163,184,0.26)",
                    boxShadow: glowStrength,
                    transformStyle: "preserve-3d",
                    animation: `neural-float ${7 + i * 0.8}s ease-in-out infinite`,
                    animationDelay: `${i * 0.25}s`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-75"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01) 45%, rgba(255,255,255,0.04))",
                    }}
                  />

                  {(ripples[feature.id] ?? []).map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="pointer-events-none absolute rounded-full"
                      style={{
                        left: ripple.x,
                        top: ripple.y,
                        background: `${feature.color}44`,
                        border: `1px solid ${feature.color}`,
                      }}
                      initial={{ width: 0, height: 0, opacity: 0.7, x: "-50%", y: "-50%" }}
                      animate={{ width: 180, height: 180, opacity: 0 }}
                      transition={{ duration: 0.62, ease: "easeOut" }}
                    />
                  ))}

                  <div
                    className="relative z-10 mb-3 inline-flex rounded-xl border p-2.5"
                    style={{ borderColor: `${feature.color}80`, backgroundColor: "rgba(2,6,23,0.75)" }}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="relative z-10 text-sm font-semibold tracking-wide text-white">{feature.title}</h3>
                  <p className="relative z-10 mt-2 text-xs leading-relaxed text-slate-300/90">{feature.desc}</p>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="hidden md:block lg:hidden">
          <motion.div style={{ x: smoothX, y: smoothY }} className="relative mx-auto h-[560px] w-full max-w-3xl">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {features.map((feature) => {
                const active = hoveredNode === feature.id || hoveredNode === null;
                return (
                  <g key={`tablet-path-${feature.id}`}>
                    <motion.path
                      d={cardPath(feature, "tablet")}
                      fill="none"
                      stroke={feature.color}
                      strokeWidth={active ? 0.45 : 0.3}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: active ? 0.62 : 0.2 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.05, ease: "easeOut" }}
                    />
                    <motion.path
                      d={cardPath(feature, "tablet")}
                      fill="none"
                      stroke={feature.color}
                      strokeWidth={0.18}
                      strokeDasharray="2 3"
                      animate={{ strokeDashoffset: [0, -10] }}
                      transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
                      style={{ opacity: active ? 0.95 : 0.25 }}
                    />
                  </g>
                );
              })}
            </svg>

            <motion.div
              className="absolute left-1/2 top-[48%] z-20 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/35 bg-slate-950/70"
              animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 26px rgba(56,189,248,0.28)", "0 0 42px rgba(129,140,248,0.42)", "0 0 26px rgba(56,189,248,0.28)"] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex h-full w-full flex-col items-center justify-center">
                <Brain size={28} className="text-cyan-200" />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">AI Engine</p>
              </div>
            </motion.div>

            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isHovered = hoveredNode === feature.id;
              return (
                <motion.button
                  key={`tablet-card-${feature.id}`}
                  type="button"
                  onMouseEnter={() => setHoveredNode(feature.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(event) => spawnRipple(feature.id, event)}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  className="absolute z-20 w-[185px] overflow-hidden rounded-2xl border bg-white/[0.07] p-4 text-left backdrop-blur-xl"
                  style={{
                    left: `${feature.tabletPos.x}%`,
                    top: `${feature.tabletPos.y}%`,
                    transform: "translate(-50%, -50%)",
                    borderColor: isHovered ? `${feature.color}88` : "rgba(148,163,184,0.25)",
                    boxShadow: isHovered ? `0 0 22px ${feature.glow}` : "0 8px 18px rgba(0,0,0,0.26)",
                  }}
                >
                  {(ripples[feature.id] ?? []).map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="pointer-events-none absolute rounded-full"
                      style={{
                        left: ripple.x,
                        top: ripple.y,
                        background: `${feature.color}44`,
                        border: `1px solid ${feature.color}`,
                      }}
                      initial={{ width: 0, height: 0, opacity: 0.7, x: "-50%", y: "-50%" }}
                      animate={{ width: 130, height: 130, opacity: 0 }}
                      transition={{ duration: 0.58, ease: "easeOut" }}
                    />
                  ))}
                  <div className="mb-2 inline-flex rounded-xl border p-2" style={{ borderColor: `${feature.color}80` }}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-xs font-semibold text-white">{feature.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300/90">{feature.desc}</p>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="mx-auto mt-4 max-w-sm md:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 mx-auto mb-6 flex h-32 w-32 flex-col items-center justify-center rounded-full border border-cyan-300/35 bg-slate-950/70 backdrop-blur-2xl"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 26px rgba(56,189,248,0.28), inset 0 0 16px rgba(56,189,248,0.22)",
                "0 0 40px rgba(129,140,248,0.45), inset 0 0 20px rgba(129,140,248,0.26)",
                "0 0 26px rgba(56,189,248,0.28), inset 0 0 16px rgba(56,189,248,0.22)",
              ],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain size={28} className="text-cyan-200" />
            <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">AI Engine</span>
          </motion.div>

          {features.map((feature, i) => {
            const Icon = feature.icon;
            const isHovered = hoveredNode === feature.id;

            return (
              <motion.button
                key={`mobile-card-${feature.id}`}
                type="button"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                whileHover={{ scale: 1.02 }}
                onMouseEnter={() => setHoveredNode(feature.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(event) => spawnRipple(feature.id, event)}
                className="relative mb-3 w-full overflow-hidden rounded-2xl border bg-white/[0.07] p-4 text-left backdrop-blur-xl"
                style={{
                  borderColor: isHovered ? `${feature.color}88` : "rgba(148,163,184,0.26)",
                  boxShadow: isHovered ? `0 0 22px ${feature.glow}` : "0 6px 16px rgba(0,0,0,0.2)",
                }}
              >
                {(ripples[feature.id] ?? []).map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      background: `${feature.color}44`,
                      border: `1px solid ${feature.color}`,
                    }}
                    initial={{ width: 0, height: 0, opacity: 0.7, x: "-50%", y: "-50%" }}
                    animate={{ width: 160, height: 160, opacity: 0 }}
                    transition={{ duration: 0.58, ease: "easeOut" }}
                  />
                ))}
                <div className="mb-2 inline-flex rounded-xl border p-2" style={{ borderColor: `${feature.color}80` }}>
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-300/90">{feature.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes neural-float {
          0% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
          100% { transform: translate(-50%, -50%) translateY(0px); }
        }
      `}</style>
    </section>
  );
}
