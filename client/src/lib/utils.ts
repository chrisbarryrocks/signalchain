const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short"
});

/** Compact date/time for the inbox rail (narrow column). */
const inboxDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatInboxDate(value: string): string {
  return inboxDateFormatter.format(new Date(value));
}

export function joinClasses(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function ensureSentence(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "";
  }
  const first = normalized[0] ?? "";
  const capitalized = first.toUpperCase() + normalized.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

export function formatIssueTypeLabel(issueType: string): string {
  const key = issueType.trim().toLowerCase();
  const map: Record<string, string> = {
    non_logistics: "Not logistics-related",
    customs_delay: "Customs hold",
    customs_hold: "Customs hold",
    supply_shortage: "Inventory shortage",
    inventory_shortage: "Inventory shortage",
    transit_delay: "Shipment delay",
    shipment_delay: "Shipment delay",
    port_congestion_delay: "Port congestion",
    weather_delay: "Weather delay",
    schedule_change: "Production timing risk",
    logistics_update: "Operations update"
  };
  return (
    map[key] ??
    key
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
