"use client";

export function SkeletonCard({ className = "h-32" }: { className?: string }) {
  return (
    <div
      className={`animate-skeleton rounded-xl ${className}`}
      style={{
        backgroundColor: "var(--bg-skeleton)",
        border: "1px solid var(--border)",
      }}
    />
  );
}

export function SkeletonChart({ className = "h-[240px]" }: { className?: string }) {
  return (
    <div
      className={`animate-skeleton rounded-xl ${className}`}
      style={{
        backgroundColor: "var(--bg-skeleton)",
        border: "1px solid var(--border)",
      }}
    />
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="animate-skeleton mb-4 h-5 w-48 rounded"
        style={{ backgroundColor: "var(--bg-skeleton)" }}
      />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={`skeleton-row-${index}`} className="grid grid-cols-12 gap-3">
            <div className="animate-skeleton col-span-3 h-4 rounded" style={{ backgroundColor: "var(--bg-skeleton)" }} />
            <div className="animate-skeleton col-span-2 h-4 rounded" style={{ backgroundColor: "var(--bg-skeleton)" }} />
            <div className="animate-skeleton col-span-2 h-4 rounded" style={{ backgroundColor: "var(--bg-skeleton)" }} />
            <div className="animate-skeleton col-span-2 h-4 rounded" style={{ backgroundColor: "var(--bg-skeleton)" }} />
            <div className="animate-skeleton col-span-3 h-4 rounded" style={{ backgroundColor: "var(--bg-skeleton)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
