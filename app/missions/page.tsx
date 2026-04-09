"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lock, MapPinned } from "lucide-react";

type MissionItem = {
  id: string;
  missionNumber: number;
  title: string;
  completed: boolean;
  completedAt: string | null;
  description: string;
  task: string;
  skill: string;
};

type MissionResponse = {
  missions: MissionItem[];
  completedCount: number;
  totalMissions: number;
  level: string;
  currentMissionNumber: number;
};

function cardState(mission: MissionItem, currentMissionNumber: number) {
  if (mission.completed) return "completed" as const;
  if (mission.missionNumber === currentMissionNumber) return "current" as const;
  return "locked" as const;
}

export default function MissionsPage() {
  const [data, setData] = useState<MissionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadMissions() {
      try {
        const response = await fetch("/api/missions", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load missions");
        }
        const payload = (await response.json()) as MissionResponse;
        if (mounted) setData(payload);
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMissions();
  }, []);

  const progressPercent = useMemo(() => {
    if (!data || data.totalMissions === 0) return 0;
    return (data.completedCount / data.totalMissions) * 100;
  }, [data]);

  if (loading) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#9ca3af]">Loading mission trail...</section>;
  }

  if (!data) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#ef4444]">Could not load missions.</section>;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">Mission Trail</h1>
              <p className="mt-2 text-slate-400">Master trading discipline one mission at a time.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-200">
              <MapPinned size={16} /> {data.level}
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>{data.completedCount}/{data.totalMissions} Missions Complete</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {data.missions.map((mission, index) => {
            const state = cardState(mission, data.currentMissionNumber);
            const connector = index < data.missions.length - 1;
            return (
              <div key={mission.id} className="relative pl-12">
                <div
                  className={`absolute left-[17px] top-2 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                    state === "completed"
                      ? "border-emerald-400 bg-emerald-500 text-white"
                      : state === "current"
                        ? "border-blue-400 bg-blue-500 text-white animate-pulse"
                        : "border-slate-600 bg-slate-800 text-slate-300"
                  }`}
                >
                  {state === "completed" ? <CheckCircle2 size={16} /> : state === "locked" ? <Lock size={14} /> : mission.missionNumber}
                </div>
                {connector ? <div className="absolute left-[31px] top-10 h-[calc(100%+4px)] w-px bg-slate-700" /> : null}

                <article
                  className={`rounded-2xl border p-5 transition ${
                    state === "completed"
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : state === "current"
                        ? "border-blue-500/40 bg-blue-500/10"
                        : "border-slate-700 bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mission {mission.missionNumber}</p>
                      <h2 className="mt-1 text-xl font-semibold text-white">{mission.title}</h2>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{mission.skill}</span>
                  </div>

                  <p className="mt-3 text-sm text-slate-300">{mission.description}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    <span className="font-semibold text-slate-100">Task:</span> {mission.task}
                  </p>

                  {mission.completedAt ? (
                    <p className="mt-3 text-xs text-emerald-300">
                      Completed on {new Date(mission.completedAt).toLocaleString()}
                    </p>
                  ) : null}

                  {state === "current" ? (
                    <div className="mt-4">
                      <Link
                        href={mission.missionNumber === 6 ? "/mistakes" : mission.missionNumber === 10 ? "/competitions" : "/trade"}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                      >
                        Start Mission
                      </Link>
                    </div>
                  ) : null}
                </article>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
