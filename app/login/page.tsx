"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/dashboard",
      email,
      password,
    });

    setLoading(false);

    if (!res || res.error) {
      setError(res?.error || "Login failed");
      return;
    }

    const targetUrl = res.url || "/dashboard";
    window.location.assign(targetUrl);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-[#0f1629] p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
        <div>
          <h1 className="text-3xl font-semibold text-white">Login</h1>
          <p className="mt-2 text-slate-400">Sign in to access your TradeSphere account.</p>
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
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="mt-3 text-slate-400">
        Don't have an account? <a className="text-blue-400" href="/signup">Signup</a>
      </p>
      </div>
    </main>
  );
}
