import type { ExtractionResult } from "../../features/extraction/types";
import { formatIssueTypeLabel } from "../../lib/utils";
import { FieldRow } from "./FieldRow";

function trimText(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const t = value.trim();
  return t.length > 0 ? t : null;
}

interface FieldDef {
  key: string;
  label: string;
  value: string;
}

export function ExtractedDetailsCard({ result }: { result: ExtractionResult }) {
  const fields: FieldDef[] = [];

  const ref = trimText(result.shipmentReference);
  if (ref) {
    fields.push({ key: "shipment", label: "Shipment reference", value: ref });
  }

  const issue = trimText(result.issueType);
  if (issue) {
    fields.push({ key: "issue", label: "Issue type", value: formatIssueTypeLabel(issue) });
  }

  const cause = trimText(result.cause);
  if (cause) {
    fields.push({ key: "cause", label: "Cause", value: cause });
  }

  if (result.delayDays !== null && result.delayDays !== undefined) {
    fields.push({ key: "delay", label: "Delay days", value: String(result.delayDays) });
  }

  const eta = trimText(result.updatedEta);
  if (eta) {
    fields.push({ key: "eta", label: "Updated ETA", value: eta });
  }

  const loc = trimText(result.impactedLocation);
  if (loc) {
    fields.push({ key: "loc", label: "Impacted location", value: loc });
  }

  fields.push({ key: "confidence", label: "Confidence", value: result.confidence });

  if (fields.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-[var(--border-panel)] bg-[var(--bg-elevated)]
        px-5 py-1 shadow-[var(--shadow-card)]"
    >
      <p className="border-b border-[var(--border-card)] py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--text-label)]">
        Key details
      </p>
      <dl>
        {fields.map((f, i) => (
          <FieldRow
            key={f.key}
            label={f.label}
            value={f.value}
            isLast={i === fields.length - 1}
          />
        ))}
      </dl>
    </section>
  );
}
