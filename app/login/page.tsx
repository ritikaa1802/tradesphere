"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (!res || res.error) {
      setError(res?.error || "Login failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <h1 className="mb-4 text-3xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded bg-slate-800 p-5">
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
    </main>
  );
}
