interface InboxRailPlaceholderProps {
  onConnectRequest?: () => void;
}

function ShimmerRow({ wide }: { wide?: boolean }) {
  return (
    <div className="border-l-2 border-l-transparent py-3 pl-3 pr-2">
      <div
        className={`h-3 animate-pulse rounded-sm bg-[var(--bg-elevated)] ${wide ? "w-[82%]" : "w-[64%]"}`}
      />
      <div className="mt-2 h-2.5 w-[40%] animate-pulse rounded-sm bg-[var(--bg-elevated)]" />
      <div className="mt-2 h-2 w-full animate-pulse rounded-sm bg-[var(--bg-elevated)]/60" />
    </div>
  );
}

export function InboxRailPlaceholder({ onConnectRequest }: InboxRailPlaceholderProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Explanation */}
      <div className="px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">
          Inbox
        </p>
        <p className="mt-2 text-[13px] font-medium text-[var(--text-secondary)]">
          Messages will appear here
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--text-muted)]">
          Connect Gmail to load your recent vendor and logistics threads.
        </p>
        {onConnectRequest ? (
          <button
            className="mt-4 text-[12px] font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            onClick={onConnectRequest}
            type="button"
          >
            Open Google sign-in →
          </button>
        ) : null}
      </div>

      {/* Shimmer rows to suggest inbox content */}
      <div className="mt-4 border-t border-[var(--border-card)] opacity-50">
        <ShimmerRow wide />
        <ShimmerRow />
        <ShimmerRow wide />
        <ShimmerRow />
        <ShimmerRow wide />
      </div>
    </div>
  );
}
