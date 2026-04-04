"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const traderOptions = ["Beginner", "Intermediate"];
const styleOptions = ["Intraday", "Swing", "Long-term"];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [traderType, setTraderType] = useState("");
  const [tradingStyle, setTradingStyle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function saveProfile() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traderType, tradingStyle }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to save onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (e) {
      setError("Failed to save onboarding");
    } finally {
      setLoading(false);
    }
  }

  const nextStep = () => {
    if (step === 1 && traderType) {
      setStep(2);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      nextStep();
      return;
    }
    if (step === 2) {
      saveProfile();
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-[#0f1629] p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
        <div>
          <h1 className="text-3xl font-semibold text-white">Onboarding</h1>
          <p className="mt-2 text-slate-400">Set up your trader profile and style preferences.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
        {step === 1 && (
          <div>
            <p className="mb-3 text-slate-300">Choose your trader type:</p>
            <div className="space-y-2">
              {traderOptions.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="traderType"
                    value={option}
                    checked={traderType === option}
                    onChange={() => setTraderType(option)}
                    className="h-4 w-4"
                    required
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-slate-300">Choose your trading style:</p>
            <div className="space-y-2">
              {styleOptions.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tradingStyle"
                    value={option}
                    checked={tradingStyle === option}
                    onChange={() => setTradingStyle(option)}
                    className="h-4 w-4"
                    required
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 py-2">
          {loading ? "Saving..." : step === 1 ? "Next" : "Finish"}
        </button>
      </form>
      </div>
    </main>
  );
}
