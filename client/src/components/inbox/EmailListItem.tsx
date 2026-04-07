import { formatInboxDate, joinClasses } from "../../lib/utils";
import type { EmailSummary } from "../../features/inbox/types";

interface EmailListItemProps {
  email: EmailSummary;
  isSelected: boolean;
  onSelect: (emailId: string) => void;
  deemphasized?: boolean;
}

export function EmailListItem({
  email,
  isSelected,
  onSelect,
  deemphasized
}: EmailListItemProps) {
  return (
    <button
      className={joinClasses(
        "group w-full border-l-2 py-3 pl-3 pr-2 text-left transition-all duration-100",
        deemphasized ? "opacity-70" : "",
        isSelected
          ? "border-l-[var(--accent)] bg-[var(--accent-glow-bg)]"
          : "border-l-transparent hover:border-l-slate-600/70 hover:bg-[var(--bg-elevated)]"
      )}
      onClick={() => onSelect(email.id)}
      type="button"
    >
      {/* Subject */}
      <p
        className={joinClasses(
          "line-clamp-1 text-sm font-medium leading-snug",
          isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
        )}
      >
        {email.subject}
      </p>

      {/* Sender + date row */}
      <div className="mt-1.5 flex min-w-0 items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-xs text-[var(--text-muted)]">
          {email.from}
        </p>
        <time
          className="shrink-0 text-[11px] tabular-nums text-[var(--text-label)]"
          dateTime={email.date}
        >
          {formatInboxDate(email.date)}
        </time>
      </div>

      {/* Snippet */}
      {email.snippet ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
          {email.snippet}
        </p>
      ) : null}
    </button>
  );
}
