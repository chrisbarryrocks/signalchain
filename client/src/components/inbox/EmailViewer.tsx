import { formatDateTime, joinClasses } from "../../lib/utils";
import type { EmailDetail } from "../../features/inbox/types";

interface EmailViewerProps {
  email: EmailDetail;
  likelyLogistics: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
}

export function EmailViewer({
  email,
  likelyLogistics,
  onAnalyze,
  isAnalyzing,
  hasAnalysis
}: EmailViewerProps) {
  return (
    <section>
      {/* Header — gradient surface, metadata + CTA */}
      <div
        className="rounded-xl bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-panel)]
          px-5 pt-5 pb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Subject + metadata chips */}
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold leading-snug text-[var(--text-primary)]">
              {email.subject}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <MetaChip label="From" value={email.from} />
              <MetaChip label="Date" value={formatDateTime(email.date)} />
              <span
                className={joinClasses(
                  "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                  likelyLogistics
                    ? "bg-[var(--accent-glow-bg)] text-[var(--accent)]"
                    : "bg-[var(--bg-inset)] text-[var(--text-muted)]"
                )}
              >
                {likelyLogistics ? "Likely logistics" : "Likely off-topic"}
              </span>
            </div>
          </div>

          {/* Analyze CTA */}
          <button
            className={joinClasses(
              "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition",
              isAnalyzing
                ? "cursor-wait bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                : "bg-[var(--accent)] text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            )}
            disabled={isAnalyzing}
            onClick={onAnalyze}
            type="button"
          >
            {isAnalyzing ? (
              <>
                <span
                  aria-hidden
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent"
                />
                Analyzing…
              </>
            ) : hasAnalysis ? (
              "Re-analyze"
            ) : (
              "Analyze email"
            )}
          </button>
        </div>
      </div>

      {/* Body — inset recessed surface */}
      <div
        className="mt-3 rounded-xl bg-[var(--bg-inset)] py-5 pl-3 pr-4
          shadow-[inset_0_1px_8px_rgba(0,0,0,0.4)]"
      >
        <div
          className="max-w-2xl whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text-secondary)]
            [overflow-wrap:anywhere]"
        >
          {email.body}
        </div>
      </div>
    </section>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-inset)] px-3 py-1 text-xs">
      <span className="font-semibold uppercase tracking-wider text-[var(--text-label)]">{label}</span>
      <span className="text-[var(--text-secondary)]">{value}</span>
    </span>
  );
}
