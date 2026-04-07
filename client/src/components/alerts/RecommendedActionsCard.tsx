interface RecommendedActionsCardProps {
  actions: string[];
}

export function RecommendedActionsCard({
  actions
}: RecommendedActionsCardProps) {
  const trimmed = actions.map((a) => a.trim()).filter(Boolean);
  if (trimmed.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-[var(--border-panel)] bg-[var(--bg-elevated)]
        px-5 py-1 shadow-[var(--shadow-card)]"
    >
      <p className="border-b border-[var(--border-card)] py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--text-label)]">
        Recommended actions
      </p>
      <ol>
        {trimmed.map((action, index) => (
          <li
            key={`${index}-${action.slice(0, 48)}`}
            className={`flex items-start gap-3 py-3 ${
              index < trimmed.length - 1 ? "border-b border-[var(--border-card)]" : ""
            }`}
          >
            <span
              className="mt-px w-4 shrink-0 text-right text-[11px] font-bold tabular-nums text-[var(--accent)]"
              aria-hidden
            >
              {index + 1}.
            </span>
            <p className="text-sm leading-snug text-[var(--text-secondary)]">{action}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
