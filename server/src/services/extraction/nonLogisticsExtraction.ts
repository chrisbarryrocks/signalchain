import type { ExtractionResultSchema } from "../../schemas/extraction.js";

export const DEFAULT_NON_LOGISTICS_SUMMARY =
  "This message does not appear to describe a vendor or logistics operations update. No shipment references, delays, or supply-chain impacts were inferred.";

export function buildNonLogisticsBase(
  summaryOverride?: string | null
): Omit<ExtractionResultSchema, "recommendedActions"> {
  const summary =
    typeof summaryOverride === "string" && summaryOverride.trim().length > 0
      ? summaryOverride.trim()
      : DEFAULT_NON_LOGISTICS_SUMMARY;

  return {
    logisticsRelevant: false,
    shipmentReference: null,
    issueType: "non_logistics",
    severity: "low",
    confidence: "high",
    summary,
    cause: null,
    delayDays: null,
    updatedEta: null,
    impactedLocation: null,
    businessImpact: null
  };
}
