"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = (searchParams.get("email") || "").toLowerCase();
  const type = searchParams.get("type") || "login";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const otp = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    if (otp.length === 6 && digits.every((d) => d.length === 1)) {
      void verifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  function onDigitChange(index: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);

    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function onKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function resendOtp() {
    setMessage("");
    const password = sessionStorage.getItem("pendingPassword") || "";

    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data?.error || "Failed to resend OTP");
      return;
    }

    setCountdown(30);
    setMessage("OTP resent successfully");
  }

  async function verifyOtp() {
    if (loading || otp.length !== 6) {
      return;
    }

    setLoading(true);
    setMessage("");

    const password = sessionStorage.getItem("pendingPassword") || "";
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, type, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data?.error || "OTP verification failed");
      setLoading(false);
      return;
    }

    if (type === "signup") {
      sessionStorage.removeItem("pendingPassword");
      router.replace("/login");
      return;
    }

    const signInResult = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/dashboard",
      email,
      password,
    });

    sessionStorage.removeItem("pendingPassword");
    if (!signInResult || signInResult.error) {
      setMessage(signInResult?.error || "Unable to complete login");
      setLoading(false);
      return;
    }

    window.location.assign(signInResult.url || "/dashboard");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-[#0f1629] p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
        <div>
          <h1 className="text-3xl font-semibold text-white">Check your email</h1>
          <p className="mt-2 text-slate-400">We sent a 6-digit code to {email}</p>
        </div>

        <div className="flex justify-between gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              value={digit}
              onChange={(e) => onDigitChange(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e.key)}
              maxLength={1}
              className="h-12 w-12 rounded-lg border border-slate-700 bg-slate-900 text-center text-xl text-white outline-none focus:border-blue-500"
            />
          ))}
        </div>

        {message ? <p className="text-sm text-amber-300">{message}</p> : null}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={resendOtp}
            disabled={countdown > 0}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Resend OTP
          </button>
          <p className="text-sm text-slate-400">{countdown > 0 ? `Resend in ${countdown}s` : "You can resend now"}</p>
        </div>
      </div>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-screen w-full max-w-md px-4 py-10 sm:px-6 lg:px-8"><p className="text-slate-300">Loading...</p></main>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
