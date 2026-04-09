"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

type Slide = {
  title: string;
  text: string;
};

const SLIDES: Slide[] = [
  {
    title: "Welcome to Trading Simulator",
    text: "This app helps you practice disciplined trading",
  },
  {
    title: "What to do here",
    text: "Click on any stock to begin",
  },
  {
    title: "What happens next",
    text: "You will enter a live trading screen with price, news, and pressure signals",
  },
  {
    title: "Before trading",
    text: "You must log your emotion before placing a trade",
  },
  {
    title: "Goal",
    text: "Focus on discipline, not just profit",
  },
];

export default function GuidanceBooklet({
  open,
  onClose,
  onFinish,
}: {
  open: boolean;
  onClose: () => void;
  onFinish: () => void;
}) {
  const [step, setStep] = useState(0);

  const isLast = useMemo(() => step === SLIDES.length, [step]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-[#0b1220] p-6 shadow-2xl transition-all duration-300">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-slate-400">Trade Page Guide</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:bg-slate-800"
            aria-label="Close guide"
          >
            <X size={16} />
          </button>
        </div>

        {!isLast ? (
          <div className="min-h-[180px] rounded-xl border border-slate-700 bg-slate-900/50 p-5 transition-all duration-300">
            <h3 className="text-2xl font-semibold text-white">{SLIDES[step].title}</h3>
            <p className="mt-3 text-slate-300">{SLIDES[step].text}</p>
          </div>
        ) : (
          <div className="min-h-[180px] rounded-xl border border-blue-500/40 bg-blue-500/10 p-5 transition-all duration-300">
            <h3 className="text-2xl font-semibold text-white">Ready?</h3>
            <p className="mt-3 text-blue-100">You are all set. Open a stock and start your disciplined practice flow.</p>
            <button
              type="button"
              onClick={onFinish}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Start Trading
            </button>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: SLIDES.length + 1 }).map((_, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  index === step ? "bg-blue-400" : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(SLIDES.length, prev + 1))}
              disabled={isLast}
              className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
