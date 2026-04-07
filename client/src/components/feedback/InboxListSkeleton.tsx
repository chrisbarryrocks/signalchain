function SkeletonRow({ narrow }: { narrow?: boolean }) {
  return (
    <div className="border-l-2 border-l-transparent py-3 pl-3 pr-2">
      <div
        className={`h-3 animate-pulse rounded-sm bg-[var(--bg-elevated)] ${narrow ? "w-[60%]" : "w-[80%]"}`}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="h-2.5 w-[38%] animate-pulse rounded-sm bg-[var(--bg-elevated)]" />
        <div className="h-2 w-12 animate-pulse rounded-sm bg-[var(--bg-elevated)]" />
      </div>
      <div className="mt-2 h-2 w-full animate-pulse rounded-sm bg-[var(--bg-elevated)]/60" />
      <div className="mt-1.5 h-2 w-[85%] animate-pulse rounded-sm bg-[var(--bg-elevated)]/50" />
    </div>
  );
}

export function InboxListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading inbox"
      className="flex flex-col"
      role="status"
    >
      {/* Fake search bar */}
      <div className="mb-3 px-1">
        <div className="h-9 w-full animate-pulse rounded-lg bg-[var(--bg-elevated)]" />
      </div>
      {/* Fake section divider */}
      <div className="my-1 flex items-center gap-2 px-3">
        <div className="h-px flex-1 animate-pulse bg-[var(--bg-elevated)]" />
        <div className="h-2 w-16 animate-pulse rounded-sm bg-[var(--bg-elevated)]" />
        <div className="h-px flex-1 animate-pulse bg-[var(--bg-elevated)]" />
      </div>
      <SkeletonRow />
      <SkeletonRow narrow />
      <SkeletonRow />
      <SkeletonRow narrow />
      <SkeletonRow />
      <SkeletonRow narrow />
    </div>
  );
}
