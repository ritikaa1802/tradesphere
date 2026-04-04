"use client";

import { useEffect, useState } from "react";

interface PendingOrder {
  id: string;
  stock: string;
  type: string;
  orderType: string;
  status: string;
  quantity: number;
  price: number;
  targetPrice: number | null;
  currentPrice: number | null;
  createdAt: string;
}

function badgeClass(status: string) {
  if (status === "pending") {
    return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  }
  if (status === "triggered") {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  }
  return "bg-rose-500/20 text-rose-300 border-rose-500/30";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadOrders() {
    try {
      const response = await fetch("/api/orders/pending", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed");
      }
      const data = (await response.json()) as { orders: PendingOrder[] };
      setOrders(data.orders || []);
    } catch {
      setMessage("Unable to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    const id = setInterval(loadOrders, 30000);
    return () => clearInterval(id);
  }, []);

  async function cancelOrder(id: string) {
    setMessage("");
    try {
      const response = await fetch(`/api/orders/${id}/cancel`, { method: "PATCH" });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "Could not cancel order");
        return;
      }

      setOrders((previous) =>
        previous.map((order) =>
          order.id === id
            ? { ...order, status: "cancelled" }
            : order,
        ),
      );
    } catch {
      setMessage("Could not cancel order");
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">Orders</h1>
          <p className="mt-2 text-slate-400">Track all your limit and stop-loss orders.</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          {loading ? (
            <p className="text-slate-400">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-slate-400">No pending orders right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="py-2">Stock</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Order Type</th>
                    <th className="py-2">Target</th>
                    <th className="py-2">Current</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-800">
                      <td className="py-3 font-semibold text-white">{order.stock}</td>
                      <td className={`py-3 ${order.type === "buy" ? "text-emerald-300" : "text-rose-300"}`}>{order.type.toUpperCase()}</td>
                      <td className="py-3 text-slate-300">{order.orderType === "stopLoss" ? "Stop Loss" : "Limit"}</td>
                      <td className="py-3 text-slate-300">{typeof order.targetPrice === "number" ? `₹${order.targetPrice.toFixed(2)}` : "-"}</td>
                      <td className="py-3 text-slate-300">{typeof order.currentPrice === "number" ? `₹${order.currentPrice.toFixed(2)}` : "-"}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${badgeClass(order.status)}`}>
                          {order.status === "triggered" ? "Triggered" : order.status === "cancelled" ? "Cancelled" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3">
                        {order.status === "pending" ? (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {message ? <p className="mt-3 text-sm text-amber-300">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}
