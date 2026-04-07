interface HeaderProps {
  gmailConnected: boolean;
  connectedEmail?: string | null;
  onDisconnect: () => void;
  disconnectDisabled?: boolean;
}

export function Header({
  gmailConnected,
  connectedEmail,
  onDisconnect,
  disconnectDisabled
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className="shrink-0 text-sm font-black uppercase tracking-[0.34em] text-[var(--accent)] sm:text-base">
          SIGNALCHAIN
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {gmailConnected ? (
          <>
            {connectedEmail ? (
              <span className="max-w-[220px] truncate text-xs text-[var(--text-secondary)] sm:max-w-none sm:text-sm">
                {connectedEmail}
              </span>
            ) : null}
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
              {disconnectDisabled ? "Disconnecting..." : "Disconnect"}
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
