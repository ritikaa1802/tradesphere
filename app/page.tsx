import Link from "next/link";
import { Globe } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#060b14] text-white">
      <header className="sticky top-0 z-50 border-b border-[#1a2744] bg-[#060b14]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d1421] text-[#3b82f6]">
              <Globe size={18} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide">TradeSphere</p>
              <p className="text-xs text-[#9ca3af]">Trading Terminal</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-[#d1d5db] md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/login" className="rounded-lg border border-[#1a2744] bg-transparent px-3 py-2 text-sm font-semibold text-white hover:bg-[#0d1421] sm:px-4">
              Login
            </Link>
            <Link href="/signup" className="rounded-lg bg-[#3b82f6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] sm:px-4">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="rounded-3xl border border-[#1a2744] bg-gradient-to-br from-[#0d1421] via-[#0b1320] to-[#0a111b] p-6 sm:p-8 lg:p-12">
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Trade Smarter. Learn Faster. Lose Less.</h1>
          <p className="mt-5 max-w-3xl text-base text-[#9ca3af] sm:text-lg">
            India&apos;s only paper trading app with AI behavioral coaching, emotion tracking, and personalized mistake detection.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-lg bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2563eb]">
              Start Trading Free
            </Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center rounded-lg border border-[#1a2744] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0f1929]">
              See How It Works
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            {[
              "🧠 AI-Powered Coaching",
              "📊 Real NSE/BSE Prices",
              "😤 Emotion Tracking",
              "🏆 Weekly Competitions",
            ].map((item) => (
              <div key={item} className="rounded-lg border border-[#1a2744] bg-[#0a0f1a] px-4 py-3 text-[#d1d5db]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to become a better trader</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "🧠 AI Coach", desc: "Get personalized weekly reports based on your actual trades" },
            { title: "😤 Emotion Journal", desc: "Track your mood before every trade and see how it affects P&L" },
            { title: "🚨 Mistake Detector", desc: "Auto-detect panic selling, revenge trading, and FOMO entries" },
            { title: "📈 Live Market Data", desc: "Real NSE/BSE prices with candlestick charts and indicators" },
            { title: "🏆 Leaderboard", desc: "Compete with traders across India in weekly competitions" },
            { title: "📊 Deep Analytics", desc: "Win rate, risk score, loss breakdown and behavioral insights" },
          ].map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-[#1a2744] bg-[#0d1421] p-5">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-[#9ca3af]">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#1a2744] bg-[#0d1421] p-6 sm:p-8">
          <h2 className="text-3xl font-bold">How TradeSphere works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Step 1: Sign up + get ₹1,00,000 virtual cash",
              "Step 2: Trade real NSE/BSE stocks with live prices",
              "Step 3: Get AI insights and improve every week",
            ].map((step) => (
              <div key={step} className="rounded-xl border border-[#1a2744] bg-[#0a0f1a] p-4 text-sm text-[#d1d5db]">
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">Simple, transparent pricing</h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#1a2744] bg-[#0d1421] p-6">
            <h3 className="text-2xl font-bold">Free</h3>
            <ul className="mt-4 space-y-2 text-sm text-[#d1d5db]">
              <li>Virtual ₹1,00,000</li>
              <li>Basic portfolio tracking</li>
              <li>Trade history</li>
              <li>1 AI report/month</li>
              <li>Leaderboard access</li>
            </ul>
            <Link href="/signup" className="mt-6 inline-flex rounded-lg border border-[#1a2744] px-4 py-2 text-sm font-semibold hover:bg-[#0f1929]">
              Get Started Free
            </Link>
          </div>

          <div className="relative rounded-2xl border border-[#3b82f6] bg-[#0d1421] p-6 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]">
            <span className="absolute right-4 top-4 rounded-full bg-[#3b82f6] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Most Popular</span>
            <h3 className="text-2xl font-bold">Pro ₹299/month</h3>
            <ul className="mt-4 space-y-2 text-sm text-[#d1d5db]">
              <li>Everything in Free</li>
              <li>Unlimited AI reports</li>
              <li>Full insight breakdown</li>
              <li>Weekly email report</li>
              <li>Export CSV</li>
              <li>Pro badge</li>
              <li>Advanced analytics</li>
            </ul>
            <Link href="/signup" className="mt-6 inline-flex rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563eb]">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1a2744] bg-[#060b14]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-white">
            <Globe size={16} className="text-[#3b82f6]" />
            <span className="font-semibold">TradeSphere</span>
          </div>

          <div className="flex items-center gap-4 text-[#9ca3af]">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </div>

          <div className="text-[#9ca3af]">Built for Indian traders 🇮🇳</div>
        </div>

        <div className="border-t border-[#1a2744] px-4 py-4 text-center text-xs text-[#6b7280] sm:px-6 lg:px-8">
          © {new Date().getFullYear()} TradeSphere. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
