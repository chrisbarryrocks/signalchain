import type { ExtractionResultSchema } from "../../schemas/extraction.js";

type Severity = ExtractionResultSchema["severity"];
type Confidence = ExtractionResultSchema["confidence"];

export interface MockHeuristicResult
  extends Omit<ExtractionResultSchema, "recommendedActions"> {}

const SMALL_NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fourteen: 14
};

function normalizeForMatch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function extractShipmentReference(subject: string, body: string): string | null {
  const combined = `${subject}\n${body}`;

  const ups = combined.match(/\b1Z[A-Z0-9]{16}\b/i);
  if (ups?.[0]) {
    return ups[0].toUpperCase();
  }

  const refPatterns: RegExp[] = [
    /\b(?:po|p\.o\.)\s*#?\s*([A-Z0-9][A-Z0-9-]{2,})/gi,
    /\border\s*#?\s*([A-Z0-9][A-Z0-9-]{2,})/gi,
    /\bshipment\s*#?\s*([A-Z0-9][A-Z0-9-]{2,})/gi,
    /\bcontainer\s*#?\s*([A-Z0-9]{4,11})\b/gi,
    /\b(?:container|cntr)\s+([A-Z0-9]{4,11})\b/gi,
    /\b(?:bol|b\/l)\s*#?\s*([A-Z0-9-]{4,})/gi,
    /\b(?:awb|air\s*waybill)\s*#?\s*([A-Z0-9-]{4,})/gi,
    /\b(?:pro|pro\s*#)\s*#?\s*([A-Z0-9-]{4,})/gi,
    /\b(?:load|loading)\s*#?\s*([A-Z0-9-]{3,})/gi,
    /\bTRK[- ]?([A-Z0-9]{6,})\b/gi
  ];

  for (const pattern of refPatterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(combined);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }

  const looseContainer = combined.match(/\bcontainer\s+([0-9]{1,3}[A-Z]?)\b/i);
  if (looseContainer?.[1]) {
    return `Container ${looseContainer[1]}`;
  }

  return null;
}

export function extractDelayDays(normalized: string): number | null {
  const hourMatch = normalized.match(/(\d+)\s*hours?\b/);
  if (hourMatch?.[1]) {
    const hours = Number.parseInt(hourMatch[1], 10);
    if (Number.isFinite(hours) && hours > 0) {
      return Math.max(1, Math.ceil(hours / 24));
    }
  }

  if (/\b24[\s-]*hour\b/.test(normalized) || /\bone[\s-]*day\b/.test(normalized)) {
    return 1;
  }

  const dayMatch = normalized.match(/(\d+)\s*days?\b/);
  if (dayMatch?.[1]) {
    const days = Number.parseInt(dayMatch[1], 10);
    return Number.isFinite(days) ? days : null;
  }

  const approxDay = normalized.match(
    /\b(?:approximately|about|around|roughly)\s+(\d+)\s*days?\b/
  );
  if (approxDay?.[1]) {
    const days = Number.parseInt(approxDay[1], 10);
    return Number.isFinite(days) ? days : null;
  }

  const wordDay = normalized.match(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fourteen)\s+days?\b/
  );
  if (wordDay?.[1]) {
    const days = SMALL_NUMBER_WORDS[wordDay[1]];
    if (days !== undefined) {
      return days;
    }
  }

  return null;
}

function formatEtaPhrase(raw: string): string {
  const cleaned = raw.replace(/(?:st|nd|rd|th)\b/gi, "").trim();
  const match = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,?\s*(20\d{2}))?/);
  if (!match) {
    return cleaned;
  }
  const monthRaw = match[1];
  const day = match[2];
  if (!monthRaw || !day) {
    return cleaned;
  }
  const month = monthRaw.slice(0, 1).toUpperCase() + monthRaw.slice(1).toLowerCase();
  const year = match[3];
  return year ? `${month} ${day}, ${year}` : `${month} ${day}`;
}

function extractUpdatedEta(subject: string, body: string): string | null {
  const combined = `${subject}\n${body}`;

  const iso = combined.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso?.[1]) {
    return iso[1];
  }

  const usDate = combined.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);
  if (usDate?.[1] && usDate[2] && usDate[3]) {
    return `${usDate[1]}/${usDate[2]}/${usDate[3]}`;
  }

  const verbal = combined.match(
    /\b(?:updated\s+eta|new\s+eta|revised\s+eta|eta\s*(?:is|now|moved\s+to|:))\s*[:\s]+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*20\d{2})?)/i
  );
  if (verbal?.[1]) {
    return formatEtaPhrase(verbal[1]);
  }

  const simple = combined.match(
    /\beta\s+is\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?)/i
  );
  if (simple?.[1]) {
    return formatEtaPhrase(simple[1]);
  }

  return null;
}

type CauseRule = { test: (n: string) => boolean; label: string };

const CAUSE_RULES: CauseRule[] = [
  {
    test: (n) =>
      /\bcustoms\b/.test(n) ||
      /\bclearance\b/.test(n) ||
      /\bheld\s+(at|for)\s+(customs|inspection|cbp)\b/.test(n) ||
      /\bcbp\b/.test(n) ||
      /\bborder\s+delay\b/.test(n),
    label: "Customs / clearance delay"
  },
  {
    test: (n) =>
      /\bshortage\b/.test(n) ||
      /\bstock\s*out\b/.test(n) ||
      /\bout\s+of\s+stock\b/.test(n) ||
      /\bcorrugate\b/.test(n) ||
      /\bpackaging\s+shortage\b/.test(n) ||
      /\bmaterial\s+shortage\b/.test(n) ||
      (/\braw\s+material\b/.test(n) && /\bshort\b/.test(n)),
    label: "Material or packaging shortage"
  },
  {
    test: (n) =>
      /\bport\s+congestion\b/.test(n) ||
      /\bcongestion\s+at\s+(the\s+)?port\b/.test(n) ||
      /\bberth(?:ing)?\s+delay\b/.test(n) ||
      /\bterminal\s+backlog\b/.test(n) ||
      /\bqueue\s+at\s+(the\s+)?port\b/.test(n),
    label: "Port congestion / terminal delay"
  },
  {
    test: (n) =>
      /\bweather\b/.test(n) ||
      /\bstorm\b/.test(n) ||
      /\btyphoon\b/.test(n) ||
      /\bhurricane\b/.test(n) ||
      /\bhigh\s+winds?\b/.test(n),
    label: "Weather disruption"
  },
  {
    test: (n) =>
      /\bchassis\b/.test(n) ||
      /\bdrayage\b/.test(n) ||
      /\bequipment\s+shortage\b/.test(n),
    label: "Equipment / drayage constraint"
  },
  {
    test: (n) => /\blabor\b/.test(n) && /\b(short|strike|stoppage)\b/.test(n),
    label: "Labor disruption"
  },
  {
    test: (n) => /\bmechanical\b/.test(n) || /\bvessel\s+delay\b/.test(n),
    label: "Equipment or vessel delay"
  }
];

export function inferCause(normalized: string): string | null {
  for (const rule of CAUSE_RULES) {
    if (rule.test(normalized)) {
      return rule.label;
    }
  }
  return null;
}

const LOCATION_PATTERNS: { re: RegExp; format: (m: RegExpMatchArray) => string }[] = [
  {
    re: /\b(port\s+of\s+[A-Za-z][A-Za-z\s]+?)(?:\.|,|\s+instead|\s+will|\s+may|\s+and\b)/i,
    format: (m) => (m[1] ?? "").replace(/\s+/g, " ").trim() || "Named port"
  },
  { re: /\bwest\s+coast\s+dc\b/i, format: () => "West Coast DC" },
  { re: /\beast\s+coast\s+dc\b/i, format: () => "East Coast DC" },
  { re: /\bgulf\s+coast\b/i, format: () => "Gulf Coast" },
  {
    re: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+distribution\s+center\b/,
    format: (m) => `${m[1] ?? "Regional"} distribution center`
  },
  { re: /\bdistribution\s+center\b/i, format: () => "Distribution center network" },
  {
    re: /\bmidwest\s+(hub|dc|warehouse)\b/i,
    format: (m) => `Midwest ${(m[1] ?? "hub").toLowerCase()}`
  },
  { re: /\btransit\s+hub\b/i, format: () => "Transit hub" },
  {
    re: /\bwarehouse\s+in\s+([A-Za-z][A-Za-z\s]+?)(?:\.|,|\s+and\b)/i,
    format: (m) => `Warehouse (${(m[1] ?? "").trim()})`
  }
];

function extractImpactedLocation(body: string, normalized: string): string | null {
  for (const { re, format } of LOCATION_PATTERNS) {
    const match = body.match(re) ?? normalized.match(re);
    if (match) {
      return format(match);
    }
  }
  return null;
}

function inferIssueType(normalized: string, cause: string | null, delayDays: number | null): string {
  if (cause?.includes("shortage")) {
    return "supply_shortage";
  }
  if (cause?.includes("Customs")) {
    return "customs_delay";
  }
  if (cause?.includes("Port congestion")) {
    return "port_congestion_delay";
  }
  if (cause?.includes("Weather")) {
    return "weather_delay";
  }
  if (delayDays !== null && delayDays > 0) {
    return "transit_delay";
  }
  if (
    /\beta\b/.test(normalized) &&
    /\b(change|changed|moved|revis|updated|update|slip|slipped)\b/.test(normalized)
  ) {
    return "schedule_change";
  }
  return "logistics_update";
}

function inferSeverity(
  delayDays: number | null,
  cause: string | null,
  issueType: string,
  normalized: string
): Severity {
  const criticalTone =
    /\bcritical\b/.test(normalized) ||
    /\bhalt\b/.test(normalized) ||
    /\bline\s+down\b/.test(normalized);

  if (issueType === "supply_shortage" && (criticalTone || /\boutbound\b/.test(normalized))) {
    return "high";
  }

  if (cause?.includes("Customs") && delayDays !== null && delayDays >= 2) {
    return "high";
  }

  if (delayDays !== null) {
    if (delayDays >= 3) {
      return "high";
    }
    if (delayDays >= 2) {
      return cause?.includes("Weather") ? "high" : "medium";
    }
    if (delayDays >= 1) {
      return "medium";
    }
  }

  if (cause?.includes("Port congestion") && /\bwest\s+coast\b/.test(normalized)) {
    return "medium";
  }

  if (issueType === "schedule_change" && delayDays === null) {
    return "low";
  }

  if (issueType === "logistics_update" && !cause && delayDays === null) {
    return "low";
  }

  return "medium";
}

function inferConfidence(
  shipmentReference: string | null,
  delayDays: number | null,
  cause: string | null,
  updatedEta: string | null
): Confidence {
  let score = 0;
  if (shipmentReference) {
    score += 1;
  }
  if (delayDays !== null) {
    score += 1;
  }
  if (cause) {
    score += 1;
  }
  if (updatedEta) {
    score += 1;
  }
  if (score >= 3) {
    return "high";
  }
  if (score >= 1) {
    return "medium";
  }
  return "low";
}

function buildBusinessImpact(
  impactedLocation: string | null,
  delayDays: number | null,
  cause: string | null,
  shipmentReference: string | null
): string | null {
  const parts: string[] = [];

  if (delayDays !== null && delayDays > 0) {
    parts.push(`Exposure to a ${delayDays}-day slip in committed inbound timing`);
  }

  if (impactedLocation) {
    parts.push(`allocation or replenishment risk for ${impactedLocation}`);
  }

  if (cause?.includes("shortage")) {
    parts.push("potential production or outbound loading constraints");
  }

  if (cause?.includes("Customs")) {
    parts.push("downstream dock scheduling and appointment windows may need reshaping");
  }

  if (parts.length === 0) {
    if (shipmentReference) {
      return `Monitor fulfillment commitments tied to reference ${shipmentReference}.`;
    }
    return "Review downstream customer commitments and buffer stock for affected lanes.";
  }

  return `${parts[0]}${parts.length > 1 ? `; ${parts.slice(1).join("; ")}` : ""}.`;
}

function buildSummary(params: {
  issueType: string;
  delayDays: number | null;
  cause: string | null;
  shipmentReference: string | null;
  updatedEta: string | null;
}): string {
  const { issueType, delayDays, cause, shipmentReference, updatedEta } = params;
  const ref = shipmentReference ? ` (${shipmentReference})` : "";

  if (issueType === "supply_shortage") {
    return `Supply or materials constraint reported${ref}.${cause ? ` Driver: ${cause}.` : ""}`;
  }

  if (issueType === "customs_delay") {
    return `Customs or clearance delay affecting movement${ref}.${delayDays ? ` About ${delayDays} day(s) impact.` : ""}`;
  }

  if (issueType === "port_congestion_delay") {
    return `Port or terminal congestion is slowing progress${ref}.${delayDays ? ` Roughly ${delayDays} day(s) slip.` : ""}`;
  }

  if (issueType === "weather_delay") {
    return `Weather-related disruption on the lane${ref}.${delayDays ? ` Estimated ${delayDays} day(s) delay.` : ""}`;
  }

  if (issueType === "transit_delay") {
    const etaBit = updatedEta ? ` Updated ETA ${updatedEta}.` : "";
    return `Transit delay${ref}.${delayDays ? ` Approximately ${delayDays} day(s).` : ""}${etaBit}`;
  }

  if (issueType === "schedule_change") {
    return `Schedule or ETA adjustment${ref}.${updatedEta ? ` New target ${updatedEta}.` : ""}`;
  }

  return `Logistics update from vendor${ref}.${cause ? ` ${cause}.` : ""}${delayDays ? ` Delay ~${delayDays} day(s).` : ""}`;
}

export function analyzeLogisticsEmailMock(subject: string, body: string): MockHeuristicResult {
  const normalized = normalizeForMatch(`${subject}\n${body}`);

  const shipmentReference = extractShipmentReference(subject, body);
  const delayDays = extractDelayDays(normalized);
  const updatedEta = extractUpdatedEta(subject, body);
  const cause = inferCause(normalized);
  const impactedLocation = extractImpactedLocation(body, normalized);
  const issueType = inferIssueType(normalized, cause, delayDays);
  const severity = inferSeverity(delayDays, cause, issueType, normalized);
  const confidence = inferConfidence(shipmentReference, delayDays, cause, updatedEta);

  const businessImpact = buildBusinessImpact(
    impactedLocation,
    delayDays,
    cause,
    shipmentReference
  );

  const summary = buildSummary({
    issueType,
    delayDays,
    cause,
    shipmentReference,
    updatedEta
  });

  return {
    logisticsRelevant: true,
    shipmentReference,
    issueType,
    severity,
    confidence,
    summary,
    cause,
    delayDays,
    updatedEta,
    impactedLocation,
    businessImpact
  };
}
