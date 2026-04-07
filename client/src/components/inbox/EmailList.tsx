import type { EmailSummary } from "../../features/inbox/types";
import { joinClasses } from "../../lib/utils";
import { EmailListItem } from "./EmailListItem";
import { InboxSearchIcon } from "./InboxSearchIcon";

interface EmailListProps {
  likely: EmailSummary[];
  other: EmailSummary[];
  query: string;
  onQueryChange: (value: string) => void;
  selectedEmailId: string | null;
  onSelect: (emailId: string) => void;
  onRefresh: () => void | Promise<void>;
  isRefreshing: boolean;
}

function SectionDivider({ label, isFirst }: { label: string; isFirst: boolean }) {
  return (
    <div
      className={joinClasses(
        "flex items-center gap-2 px-3",
        isFirst ? "pb-1 pt-0" : "py-1"
      )}
    >
      <div className="h-px flex-1 bg-[var(--border-card)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-label)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--border-card)]" />
    </div>
  );
}

export function EmailList({
  likely,
  other,
  query,
  onQueryChange,
  selectedEmailId,
  onSelect,
  onRefresh,
  isRefreshing
}: EmailListProps) {
  const totalVisible = likely.length + other.length;
  const hasLikely = likely.length > 0;
  const hasOther = other.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 items-center gap-2 px-1">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex w-3.5 items-center text-[var(--text-label)]">
            <InboxSearchIcon className="h-3.5 w-3.5 shrink-0" />
          </span>
          <label className="sr-only" htmlFor="inbox-search">
            Search messages
          </label>
          <input
            autoComplete="off"
            className="w-full rounded-lg border border-[var(--border-panel)] bg-[var(--bg-inset)]
              py-2 pl-9 pr-3 text-[13px] text-[var(--text-primary)]
              placeholder:text-[var(--text-label)]
              focus:border-[var(--border-accent)] focus:outline-none focus:ring-1
              focus:ring-[var(--border-accent)]/50 transition"
            id="inbox-search"
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search messages…"
            type="search"
            value={query}
          />
        </div>
        <button
          aria-busy={isRefreshing}
          aria-label="Refresh inbox"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border
            border-[var(--border-panel)] bg-[var(--bg-inset)] px-2.5 text-[11px] font-medium
            text-[var(--text-muted)] transition hover:border-slate-600 hover:text-[var(--text-secondary)]
            disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRefreshing}
          onClick={() => void onRefresh()}
          type="button"
        >
          {isRefreshing ? (
            <span
              aria-hidden
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent"
            />
          ) : (
            "Refresh"
          )}
        </button>
      </div>

      <div
        aria-busy={isRefreshing}
        aria-label="Inbox messages"
        className={joinClasses(
          "relative min-h-0 flex-1 overflow-y-auto",
          isRefreshing && totalVisible > 0 ? "opacity-70 transition-opacity" : ""
        )}
      >
        {isRefreshing && totalVisible > 0 ? (
          <span className="sr-only">Refreshing inbox</span>
        ) : null}

        {totalVisible === 0 ? (
          <p className="px-3 py-3 text-[13px] text-[var(--text-muted)]">No messages match.</p>
        ) : null}

        {hasLikely ? (
          <div className={joinClasses(!hasOther ? "pb-0" : "")}>
            <SectionDivider isFirst label={`Relevant · ${likely.length}`} />
            <ul className="pb-0">
              {likely.map((email) => (
                <li key={email.id}>
                  <EmailListItem
                    email={email}
                    isSelected={selectedEmailId === email.id}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {hasOther ? (
          <div className={hasLikely ? "mt-1" : ""}>
            <SectionDivider isFirst={!hasLikely} label={`Other · ${other.length}`} />
            <ul>
              {other.map((email) => (
                <li key={email.id}>
                  <EmailListItem
                    deemphasized
                    email={email}
                    isSelected={selectedEmailId === email.id}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
