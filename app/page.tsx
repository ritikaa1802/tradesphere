import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8 rounded-3xl border border-slate-800 bg-[#0f1629] p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">TradeSphere</p>
          <h1 className="text-5xl font-semibold tracking-tight text-white">A smarter, sleeker trading dashboard for every strategy.</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">Track your portfolio, review historical trades, and get AI-guided coaching in one polished dark interface.</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/login" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500">
            Login
          </Link>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-3xl bg-slate-800 px-6 py-3 font-semibold text-slate-100 transition hover:bg-slate-700">
            Signup
          </Link>
        </div>
      </div>
    </main>
  );
}
