import type { Severity } from "../../features/extraction/types";
import { ensureSentence } from "../../lib/utils";

interface RiskAlertCardProps {
  logisticsRelevant: boolean;
  severity: Severity;
  summary: string;
  businessImpact: string | null;
}

const severityConfig: Record<
  Severity,
  { barClass: string; badgeBg: string; badgeText: string; text: string }
> = {
  high: {
    barClass: "border-l-[var(--severity-high-accent)]",
    badgeBg: "bg-[var(--severity-high-bg)]",
    badgeText: "text-[var(--severity-high-text)]",
    text: "text-[var(--severity-high-text)]"
  },
  medium: {
    barClass: "border-l-[var(--severity-medium-accent)]",
    badgeBg: "bg-[var(--severity-medium-bg)]",
    badgeText: "text-[var(--severity-medium-text)]",
    text: "text-[var(--severity-medium-text)]"
  },
  low: {
    barClass: "border-l-[var(--severity-low-accent)]",
    badgeBg: "bg-[var(--severity-low-bg)]",
    badgeText: "text-[var(--severity-low-text)]",
    text: "text-[var(--severity-low-text)]"
  }
};

export function RiskAlertCard({
  logisticsRelevant,
  severity,
  summary,
  businessImpact
}: RiskAlertCardProps) {
  const formattedSummary = ensureSentence(summary);
  const impact = businessImpact ? ensureSentence(businessImpact) : null;

  if (!logisticsRelevant) {
    return (
      <section
        className="rounded-xl border-l-4 border-l-slate-700 bg-[var(--bg-elevated)]
          px-5 py-4 shadow-[var(--shadow-card)]"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--text-label)]">
          Classification
        </p>
        <p className="mt-1.5 text-sm font-semibold text-[var(--text-primary)]">
          Not logistics-related
        </p>
        <p
          className="mt-2 line-clamp-3 text-sm leading-snug text-[var(--text-secondary)]"
          title={formattedSummary}
        >
          {formattedSummary}
        </p>
      </section>
    );
  }

  const cfg = severityConfig[severity];

  return (
    <section
      className={`rounded-xl border-l-4 bg-[var(--bg-elevated)] px-5 py-5
        shadow-[var(--shadow-card)] ${cfg.barClass}`}
    >
      {/* Label + severity badge */}
      <div className="flex items-center gap-2.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--text-label)]">
          Risk alert
        </p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide
            ${cfg.badgeBg} ${cfg.badgeText}`}
        >
          {severity}
        </span>
      </div>

      {/* Summary */}
      <p className="mt-3 text-base leading-relaxed text-[var(--text-primary)]">
        {formattedSummary}
      </p>

      {/* Business impact */}
      {impact ? (
        <div className="mt-4 border-t border-[var(--border-card)] pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--text-label)]">
            Business impact
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{impact}</p>
        </div>
      ) : null}
    </section>
  );
}
