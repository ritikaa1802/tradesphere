"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body?.error || "Signup failed");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("Could not signup. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-[#0f1629] p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
        <div>
          <h1 className="text-3xl font-semibold text-white">Signup</h1>
          <p className="mt-2 text-slate-400">Create your account and start trading with confidence.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            type="email"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            type="password"
            required
          />
        </div>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 py-2">
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="mt-3 text-slate-400">
        Already have an account? <a className="text-blue-400" href="/login">Login</a>
      </p>
      </div>
    </main>
  );
}
