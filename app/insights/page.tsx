"use client";

import { useEffect, useMemo, useState } from "react";

type InsightSeverity = "warning" | "danger" | "success" | "info";

type LossBreakdownItem = {
  type: string;
  reason: string;
  amount: number;
  percent: number;
};

type InsightItem = {
  type: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  amount?: number;
  meta?: {
    mood?: string;
    percent?: number;
    riskScore?: number;
    riskLabel?: string;
    reasons?: string[];
    breakdown?: LossBreakdownItem[];
  };
};

function severityColor(severity: InsightSeverity): string {
  if (severity === "danger") return "text-rose-400";
  if (severity === "warning") return "text-amber-400";
  if (severity === "success") return "text-emerald-400";
  return "text-blue-400";
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadInsights() {
      try {
        setError("");
        const response = await fetch("/api/insights", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load insights");
        }
        const data = (await response.json()) as InsightItem[];
        if (!mounted) return;
        setInsights(data || []);
      } catch {
        if (mounted) {
          setError("Unable to load insights right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInsights();
    const id = setInterval(loadInsights, 15000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const grouped = useMemo(() => {
    const behavior = insights.filter((i) => i.type.includes("mood") || i.type.includes("revenge") || i.type.includes("streak"));
    const risk = insights.filter((i) => i.type.includes("risk") || i.type.includes("loss"));
    const coaching = insights.filter((i) => !behavior.includes(i) && !risk.includes(i));
    return { behavior, risk, coaching };
  }, [insights]);

  if (loading) {
    return <section className="text-sm text-slate-400">Loading insights...</section>;
  }

  if (error) {
    return <section className="text-sm text-rose-400">{error}</section>;
  }

  return (
    <section className="space-y-3 text-white">
      <div className="border-b border-[#1a2744] pb-2">
        <h1 className="text-base font-semibold">Insights Terminal</h1>
        <p className="mt-1 text-xs text-slate-400">Merged behavioral, loss analysis, and coaching signals.</p>
      </div>

      {[{ label: "Behavior", data: grouped.behavior }, { label: "Risk", data: grouped.risk }, { label: "Coach", data: grouped.coaching }].map((group) => (
        <div key={group.label} className="border-b border-[#1a2744] pb-2">
          <h2 className="mb-1 text-xs font-semibold text-slate-300 uppercase tracking-wide">{group.label}</h2>
          {group.data.length === 0 ? (
            <p className="text-xs text-slate-500">No signals.</p>
          ) : (
            <div className="space-y-1">
              {group.data.slice(0, 6).map((insight) => (
                <div key={`${group.label}-${insight.type}-${insight.title}`} className="grid grid-cols-[1fr_auto] gap-2 border border-[#1a2744] px-2 py-1.5 text-xs">
                  <div>
                    <p className="font-semibold text-slate-100">{insight.title}</p>
                    <p className="text-slate-400">{insight.description}</p>
                  </div>
                  <div className={`text-right font-semibold ${severityColor(insight.severity)}`}>{insight.severity.toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
