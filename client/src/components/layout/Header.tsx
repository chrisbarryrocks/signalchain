interface HeaderProps {
  gmailConnected: boolean;
  onDisconnect: () => void;
  disconnectDisabled?: boolean;
}

export function Header({ gmailConnected, onDisconnect, disconnectDisabled }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 py-3">
      {/* Left — wordmark + title */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent)]">
          SignalChain
        </span>
        <span className="hidden h-4 w-px bg-[var(--border-panel)] sm:block" aria-hidden />
        <h1 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">
          Logistics alert workspace
        </h1>
      </div>

      {/* Right — connection status + action */}
      <div className="flex shrink-0 items-center gap-3">
        {gmailConnected ? (
          <>
            <span className="hidden items-center gap-1.5 text-xs text-[var(--text-muted)] sm:flex">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                aria-hidden
              />
              Gmail connected
            </span>
            <button
              className="inline-flex h-8 items-center justify-center rounded-lg border
                border-[var(--border-panel)] bg-transparent px-3 text-xs font-medium
                text-[var(--text-secondary)] transition
                hover:border-slate-500/60 hover:bg-[var(--bg-elevated)]
                disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disconnectDisabled}
              onClick={onDisconnect}
              type="button"
            >
              {disconnectDisabled ? "Disconnecting…" : "Disconnect"}
            </button>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-slate-600"
              aria-hidden
            />
            Not connected
          </span>
        )}
      </div>
    </header>
  );
}
