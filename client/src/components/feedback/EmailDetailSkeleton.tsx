export function EmailDetailSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading email"
      role="status"
    >
      {/* Header area — gradient surface */}
      <div
        className="rounded-xl bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-panel)]
          px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-5 max-w-xl animate-pulse rounded-md bg-[var(--bg-inset)]" />
            <div className="flex gap-2">
              <div className="h-6 w-36 animate-pulse rounded-full bg-[var(--bg-inset)]" />
              <div className="h-6 w-44 animate-pulse rounded-full bg-[var(--bg-inset)]" />
            </div>
          </div>
          <div className="h-10 w-32 shrink-0 animate-pulse rounded-lg bg-[var(--bg-inset)]" />
        </div>
      </div>

      {/* Body area — inset */}
      <div
        className="mt-3 rounded-xl bg-[var(--bg-inset)] py-5 pl-3 pr-4
          shadow-[inset_0_1px_8px_rgba(0,0,0,0.4)]"
      >
        <div className="max-w-2xl space-y-2">
          {Array.from({ length: 14 }, (_, i) => (
            <div
              className="h-3 animate-pulse rounded-sm bg-[var(--bg-elevated)]/60"
              key={i}
              style={{ width: `${65 + (i * 11) % 32}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
