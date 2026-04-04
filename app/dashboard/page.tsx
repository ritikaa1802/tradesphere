import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPortfolioSummary } from "@/lib/portfolio";
import Link from "next/link";
import PortfolioChart from "@/components/PortfolioChart";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
        <p className="text-rose-400">Unauthorized. Go to <Link href="/login">login</Link>.</p>
      </main>
    );
  }

  const summary = await getPortfolioSummary(session.user.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Dashboard</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Welcome back, {session.user.email}</h1>
              <p className="mt-2 max-w-2xl text-slate-400">A polished view of your positions, profit, and portfolio momentum.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-4">
                <p className="text-sm text-slate-400">Balance</p>
                <p className="mt-2 text-2xl font-semibold text-white">₹{summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-4">
                <p className="text-sm text-slate-400">Invested</p>
                <p className="mt-2 text-2xl font-semibold text-white">₹{summary.invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-4">
                <p className="text-sm text-slate-400">Overall P&L</p>
                <p className={`mt-2 text-2xl font-semibold ${summary.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  ₹{summary.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({summary.pnlPercentage.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        <PortfolioChart currentValue={summary.balance} />

        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
            <h2 className="text-2xl font-semibold text-white">Holdings</h2>
            {summary.holdings.length === 0 ? (
              <p className="mt-4 text-slate-400">No holdings yet. Place a trade to begin building your portfolio.</p>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-slate-400">
                      <th className="py-3">Stock</th>
                      <th className="py-3 text-right">Qty</th>
                      <th className="py-3 text-right">Avg Buy</th>
                      <th className="py-3 text-right">Current Value</th>
                      <th className="py-3 text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.holdings.map((holding) => (
                      <tr key={holding.stock} className="border-b border-slate-800 transition hover:bg-slate-900/60">
                        <td className="py-4">{holding.stock}</td>
                        <td className="py-4 text-right text-slate-200">{holding.quantity}</td>
                        <td className="py-4 text-right text-slate-200">₹{holding.avgBuyPrice.toFixed(2)}</td>
                        <td className="py-4 text-right text-slate-200">₹{holding.currentValue.toFixed(2)}</td>
                        <td className={`py-4 text-right font-semibold ${holding.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          ₹{holding.pnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Link href="/trade" className="rounded-3xl border border-slate-800 bg-blue-600/10 p-5 text-center text-white transition hover:border-blue-500 hover:bg-blue-600/15">
              <p className="font-semibold">New Trade</p>
              <p className="mt-2 text-sm text-slate-400">Quickly add a position.</p>
            </Link>
            <Link href="/history" className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-center text-white transition hover:border-blue-500 hover:bg-slate-800">
              <p className="font-semibold">Trade History</p>
              <p className="mt-2 text-sm text-slate-400">Review your executed trades.</p>
            </Link>
            <Link href="/analytics" className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-center text-white transition hover:border-blue-500 hover:bg-slate-800">
              <p className="font-semibold">Analytics</p>
              <p className="mt-2 text-sm text-slate-400">See trading performance metrics.</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
