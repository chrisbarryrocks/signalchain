interface EmptyStateProps {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">
        Empty
      </p>
      <h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">{body}</p>
    </div>
  );
}
