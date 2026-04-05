import { SkeletonCard } from "@/components/Skeleton";

export default function AnalyticsLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-[#0f1629] p-6">
          <div className="animate-skeleton h-8 w-44 rounded bg-[#1a2744]" />
          <div className="animate-skeleton mt-3 h-4 w-80 max-w-full rounded bg-[#1a2744]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <SkeletonCard key={`analytics-skeleton-${index}`} className="h-28" />
          ))}
        </div>
      </div>
    </main>
  );
}
