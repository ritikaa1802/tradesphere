"use client";

import Link from "next/link";
import { Globe, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import HeroAnimation from "@/components/HeroAnimation";
import NeuralEngine from "@/components/NeuralEngine";
import JourneyTimeline from "@/components/JourneyTimeline";
import StockTicker from "@/components/StockTicker";

// ─── Animated number counter ─────────────────────────────────────────────────
function AnimatedCounter({ end, prefix = "", suffix = "" }: { end: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(end / 60);
      const t = setInterval(() => {
        start += step;
        if (start >= end) { setCount(end); clearInterval(t); }
        else setCount(start);
      }, 20);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Pricing card ─────────────────────────────────────────────────────────────
function PricingCard({
  name,
  price,
  features,
  isPro,
  href,
}: {
  name: string;
  price: string;
  features: string[];
  isPro?: boolean;
  href: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl p-px overflow-hidden"
      style={{
        background: isPro
          ? `linear-gradient(135deg, ${hovered ? "rgba(99,102,241,0.8)" : "rgba(59,130,246,0.6)"}, rgba(124,58,237,0.6))`
          : "linear-gradient(135deg, rgba(26,39,68,0.5), rgba(15,23,42,0.5))",
        transition: "all 0.3s ease",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        boxShadow: isPro && hovered ? "0 0 60px rgba(59,130,246,0.25)" : "none",
      }}
    >
      {isPro && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent)" }}
        />
      )}
      <div
        className="relative rounded-2xl p-8 h-full"
        style={{ background: isPro ? "rgba(10,15,30,0.95)" : "rgba(13,20,35,0.95)" }}
      >
        {isPro && (
          <span
            className="absolute -top-px right-6 rounded-b-lg px-4 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: "linear-gradient(135deg, #6366f1, #3b82f6)", color: "white" }}
          >
            Most Popular
          </span>
        )}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-400 mb-2">{name}</p>
          <p className="text-4xl font-extrabold text-white">{price}</p>
        </div>
        <ul className="space-y-3 mb-8">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
              <svg className="h-4 w-4 mt-0.5 shrink-0" style={{ color: isPro ? "#6366f1" : "#22c55e" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className="block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300"
          style={
            isPro
              ? {
                  background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                  color: "white",
                  boxShadow: hovered ? "0 0 30px rgba(99,102,241,0.5)" : "none",
                }
              : {
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: hovered ? "rgba(255,255,255,0.06)" : "transparent",
                  color: "white",
                }
          }
        >
          {isPro ? "Upgrade to Pro" : "Get Started Free"}
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <main
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "#050912", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(5,9,18,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(26,39,68,0.6)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <StockTicker />
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                boxShadow: "0 0 20px rgba(29,78,216,0.4)",
              }}
            >
              <Globe size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-white leading-none">TradeSphere</p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">Trading Terminal</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
              { label: "Leaderboard", href: "/leaderboard" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTA group */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                boxShadow: "0 0 20px rgba(37,99,235,0.4)",
              }}
            >
              Start Free →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1.5 md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 flex flex-col gap-3"
            style={{ background: "rgba(5,9,18,0.98)", borderColor: "rgba(26,39,68,0.6)" }}
          >
            {["Features", "How It Works", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-sm text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1 rounded-xl border border-white/10 py-2 text-center text-sm font-semibold text-white">Login</Link>
              <Link href="/signup" className="flex-1 rounded-xl py-2 text-center text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>Start Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <HeroAnimation />

      {/* ── SOCIAL PROOF STRIP ──────────────────────────────────────────────── */}
      <div
        className="border-y py-4"
        style={{ borderColor: "rgba(26,39,68,0.5)", background: "rgba(8,14,26,0.6)", backdropFilter: "blur(8px)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <span className="text-slate-600 text-xs uppercase tracking-widest font-medium">Trusted by traders from</span>
            {["NSE Certified", "₹1L Virtual Capital", "Real-time BSE Prices", "Zero Risk Trading", "AI-Powered Insights"].map((item) => (
              <span key={item} className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                <span className="h-1 w-1 rounded-full bg-blue-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── KEY METRICS ─────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-2 gap-4 lg:grid-cols-4 rounded-2xl p-px overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.2))" }}
        >
          <div
            className="col-span-2 grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-4 rounded-2xl p-6 sm:p-8"
            style={{ background: "rgba(8,14,26,0.95)" }}
          >
            {[
              { label: "Active Traders", value: 12400, suffix: "+", prefix: "" },
              { label: "Virtual Capital Deployed", value: 10, suffix: "Cr+", prefix: "₹" },
              { label: "AI Reports Generated", value: 48000, suffix: "+", prefix: "" },
              { label: "Avg. Improvement Rate", value: 67, suffix: "%", prefix: "" },
            ].map((m) => (
              <div key={m.label} className="text-center py-2">
                <div className="text-3xl font-extrabold text-white sm:text-4xl">
                  <AnimatedCounter end={m.value} prefix={m.prefix} suffix={m.suffix} />
                </div>
                <div className="mt-1.5 text-xs text-slate-500 font-medium">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEURAL ENGINE (Formerly Features) ─────────────────────────────────── */}
      <div id="features">
        <NeuralEngine />
      </div>

      {/* ── JOURNEY TIMELINE (Formerly How it Works) ────────────────────────── */}
      <div id="how-it-works">
        <JourneyTimeline />
      </div>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-600/8 px-4 py-1.5 text-xs font-medium text-emerald-400 mb-5"
            style={{ backdropFilter: "blur(8px)" }}>
            <Trophy size={12} /> Pricing
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-slate-400 text-base">Start free, upgrade when you&apos;re ready to unlock your full edge.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
          <PricingCard
            name="Free"
            price="₹0"
            href="/signup"
            features={[
              "Virtual ₹1,00,000 capital",
              "Live NSE/BSE market data",
              "Basic portfolio tracking",
              "Trade history & P&L",
              "1 AI report per month",
              "Leaderboard access",
            ]}
          />
          <PricingCard
            name="Pro"
            price="₹299/mo"
            href="/signup"
            isPro
            features={[
              "Everything in Free",
              "Unlimited AI coaching reports",
              "Full behavioral insight breakdown",
              "Emotion tracking dashboard",
              "Mistake detection — real-time",
              "Weekly personalized email report",
              "Advanced analytics & win rate",
              "Export CSV, Pro badge",
            ]}
          />
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-center sm:p-14"
          style={{
            background: "linear-gradient(135deg, rgba(29,78,216,0.25) 0%, rgba(124,58,237,0.25) 50%, rgba(6,182,212,0.15) 100%)",
            border: "1px solid rgba(59,130,246,0.25)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Glow orb */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)", filter: "blur(60px)" }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Ready to trade smarter?
            </h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-xl mx-auto">
              Join thousands of Indian traders building real edge — without the real risk.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  boxShadow: "0 0 40px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                Start Trading Free
                <span>→</span>
              </Link>
              <Link href="/leaderboard" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/10">
                View Leaderboard
              </Link>
            </div>
            <p className="mt-5 text-xs text-slate-500">No credit card required · Free forever plan available · Built for Indian markets 🇮🇳</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t mt-8" style={{ borderColor: "rgba(26,39,68,0.5)", background: "rgba(5,9,18,0.95)" }}>
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}
                >
                  <Globe size={16} className="text-white" />
                </div>
                <span className="text-sm font-bold text-white">TradeSphere</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                India&apos;s most advanced paper trading platform with AI behavioral coaching. Built for the next generation of traders.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                All systems operational
              </div>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Platform</p>
              <ul className="space-y-3">
                {[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Trade", href: "/trade" },
                  { label: "Leaderboard", href: "/leaderboard" },
                  { label: "Analytics", href: "/analytics" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Company</p>
              <ul className="space-y-3">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Login", href: "/login" },
                  { label: "Sign Up", href: "/signup" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-slate-600 sm:flex-row"
            style={{ borderColor: "rgba(26,39,68,0.5)" }}
          >
            <span>© {new Date().getFullYear()} TradeSphere. All rights reserved.</span>
            <span>Built with ❤️ for Indian traders 🇮🇳</span>
          </div>
        </div>
      </footer>

      {/* ── Global animations ────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        html { scroll-behavior: smooth; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </main>
  );
}
