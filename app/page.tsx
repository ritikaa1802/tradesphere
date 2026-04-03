import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold">TradeSphere</h1>
      <p className="my-4 text-slate-300">Paper trading app (Phase 1)</p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500">
          Login
        </Link>
        <Link href="/signup" className="rounded bg-emerald-600 px-4 py-2 hover:bg-emerald-500">
          Signup
        </Link>
      </div>
    </main>
  );
}
