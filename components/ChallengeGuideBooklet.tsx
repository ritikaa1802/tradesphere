"use client";

import { X } from "lucide-react";

type PastChampion = {
  id: string;
  month: string;
  year: string;
  disciplineScore: number;
  displayName: string;
  badge: string;
};

export default function ChallengeGuideBooklet({
  open,
  onClose,
  countdownText,
  nextWinnerDate,
  pastChampions,
}: {
  open: boolean;
  onClose: () => void;
  countdownText: string;
  nextWinnerDate: string;
  pastChampions: PastChampion[];
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#0b1220] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Challenge Performance Guide</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:bg-slate-800"
            aria-label="Close challenge guide"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
            <h3 className="text-lg font-semibold text-white">How to Win Monthly Champion</h3>
            <ul className="mt-3 space-y-1">
              <li>Only 1 trader wins each month</li>
              <li>Highest discipline score across all challenges wins 1 month Pro free</li>
              <li>Score resets every month</li>
              <li>Next winner declared: {nextWinnerDate}</li>
            </ul>
            <p className="mt-3 text-slate-300">Countdown: {countdownText}</p>
          </article>

          <article className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
            <h3 className="text-lg font-semibold text-white">How Scoring Works</h3>
            <ul className="mt-3 space-y-1">
              <li>+10 You followed your trading plan</li>
              <li>+5 You traded calm/confident</li>
              <li>+3 Completed pre-trade checklist</li>
              <li>-10 Rule break detected</li>
              <li>-5 Impulsive trade</li>
              <li>-3 Revenge trading detected</li>
              <li>Profit and loss have ZERO impact</li>
            </ul>
          </article>
        </div>

        <article className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
          <h3 className="text-lg font-semibold text-white">Winner Rewards</h3>
          <ul className="mt-3 space-y-1">
            <li>7-Day Winner: 🥇 Champion badge</li>
            <li>30-Day Winner: 🏆 Champion badge + gold leaderboard border</li>
            <li>Monthly Champion (1 person only): 👑 Crown badge + 1 month Pro FREE + Featured on landing page all next month</li>
          </ul>
        </article>

        <article className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
          <h3 className="text-lg font-semibold text-white">Past Champions</h3>
          {pastChampions.length === 0 ? (
            <p className="mt-2 text-slate-400">No champions declared yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {pastChampions.map((champion) => (
                <div key={champion.id} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                  <p className="font-medium text-white">{champion.badge} {champion.displayName}</p>
                  <p className="text-xs text-slate-300">{champion.month}/{champion.year} • Score: {champion.disciplineScore.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
