interface FieldRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

export function FieldRow({ label, value, isLast }: FieldRowProps) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,auto)_1fr] items-baseline gap-x-4 gap-y-0 py-2.5 ${
        isLast ? "" : "border-b border-[var(--border-card)]"
      }`}
    >
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-label)]">
        {label}
      </dt>
      <dd className="text-sm text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}
