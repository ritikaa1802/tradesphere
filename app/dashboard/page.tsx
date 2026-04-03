import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPortfolioSummary } from "@/lib/portfolio";
import Link from "next/link";

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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl p-6">
      <div className="w-full">
        <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
        <div className="rounded bg-slate-800 p-5 mb-4">
          <p className="text-slate-400">Welcome, {session.user.email}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm text-slate-500">Balance</p>
              <p className="text-lg font-semibold">₹{summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Invested</p>
              <p className="text-lg font-semibold">₹{summary.invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Overall P&L</p>
              <p className={`text-lg font-semibold ${summary.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{summary.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({summary.pnlPercentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded bg-slate-800 p-5">
          <h2 className="text-xl font-bold mb-4">Holdings</h2>
          {summary.holdings.length === 0 ? (
            <p className="text-slate-500">No holdings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2">Stock</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Avg Buy Price</th>
                    <th className="text-right py-2">Current Value</th>
                    <th className="text-right py-2">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.holdings.map((holding) => (
                    <tr key={holding.stock} className="border-b border-slate-700">
                      <td className="py-2">{holding.stock}</td>
                      <td className="text-right py-2">{holding.quantity}</td>
                      <td className="text-right py-2">₹{holding.avgBuyPrice.toFixed(2)}</td>
                      <td className="text-right py-2">₹{holding.currentValue.toFixed(2)}</td>
                      <td className={`text-right py-2 ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{holding.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <Link href="/trade" className="rounded bg-emerald-600 px-4 py-2">New Trade</Link>
          <Link href="/history" className="rounded bg-purple-600 px-4 py-2">Trade History</Link>
          <Link href="/mood" className="rounded bg-pink-600 px-4 py-2">TradeMind</Link>
          <Link href="/mistakes" className="rounded bg-rose-600 px-4 py-2">Mistakes</Link>
          <Link href="/ai-coach" className="rounded bg-indigo-600 px-4 py-2">AI Coach</Link>
          <Link href="/onboarding" className="rounded bg-sky-600 px-4 py-2">Edit Onboarding</Link>
        </div>
      </div>
    </main>
  );
}
