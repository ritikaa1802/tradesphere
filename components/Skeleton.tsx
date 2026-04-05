"use client";

export function SkeletonCard({ className = "h-32" }: { className?: string }) {
  return <div className={`animate-skeleton rounded-xl border border-[#1a2744] bg-[#1a2744] ${className}`} />;
}

export function SkeletonChart({ className = "h-[240px]" }: { className?: string }) {
  return <div className={`animate-skeleton rounded-xl border border-[#1a2744] bg-[#1a2744] ${className}`} />;
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4">
      <div className="animate-skeleton mb-4 h-5 w-48 rounded bg-[#1a2744]" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={`skeleton-row-${index}`} className="grid grid-cols-12 gap-3">
            <div className="animate-skeleton col-span-3 h-4 rounded bg-[#1a2744]" />
            <div className="animate-skeleton col-span-2 h-4 rounded bg-[#1a2744]" />
            <div className="animate-skeleton col-span-2 h-4 rounded bg-[#1a2744]" />
            <div className="animate-skeleton col-span-2 h-4 rounded bg-[#1a2744]" />
            <div className="animate-skeleton col-span-3 h-4 rounded bg-[#1a2744]" />
          </div>
        ))}
      </div>
    </div>
  );
}
