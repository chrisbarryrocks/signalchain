export function AnalysisResultSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Running analysis"
      className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"
      role="status"
    >
      <div className="space-y-4">
        {/* Risk card skeleton */}
        <div
          className="rounded-xl border-l-4 border-l-slate-700 bg-[var(--bg-elevated)] px-5 py-5"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-20 animate-pulse rounded-sm bg-[var(--bg-inset)]" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-[var(--bg-inset)]" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded-sm bg-[var(--bg-inset)]" />
            <div className="h-3.5 w-[88%] animate-pulse rounded-sm bg-[var(--bg-inset)]" />
            <div className="h-3.5 w-[74%] animate-pulse rounded-sm bg-[var(--bg-inset)]" />
          </div>
        </div>

        {/* Details card skeleton */}
        <div
          className="rounded-xl border border-[var(--border-panel)] bg-[var(--bg-elevated)] px-5 py-1"
        >
          <div className="border-b border-[var(--border-card)] py-3">
            <div className="h-2.5 w-36 animate-pulse rounded-sm bg-[var(--bg-inset)]" />
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`flex gap-4 py-2.5 ${i < 3 ? "border-b border-[var(--border-card)]" : ""}`}
            >
              <div className="h-2.5 w-28 animate-pulse rounded-sm bg-[var(--bg-inset)]" />
              <div className="h-2.5 flex-1 animate-pulse rounded-sm bg-[var(--bg-inset)]/70" />
            </div>
          ))}
        </div>
      </div>

      {/* Actions card skeleton */}
      <div
        className="rounded-xl border border-[var(--border-panel)] bg-[var(--bg-elevated)] px-5 py-1"
      >
        <div className="border-b border-[var(--border-card)] py-3">
          <div className="h-2.5 w-40 animate-pulse rounded-sm bg-[var(--bg-inset)]" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className={`flex gap-3 py-3 ${i < 2 ? "border-b border-[var(--border-card)]" : ""}`}
          >
            <div className="h-2.5 w-4 animate-pulse rounded-sm bg-[var(--bg-inset)]" />
            <div className="h-2.5 flex-1 animate-pulse rounded-sm bg-[var(--bg-inset)]/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
