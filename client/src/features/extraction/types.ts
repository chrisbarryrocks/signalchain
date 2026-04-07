export type Severity = "low" | "medium" | "high";
export type Confidence = "low" | "medium" | "high";

export interface ExtractionResult {
  logisticsRelevant: boolean;
  shipmentReference: string | null;
  issueType: string;
  severity: Severity;
  confidence: Confidence;
  summary: string;
  cause: string | null;
  delayDays: number | null;
  updatedEta: string | null;
  impactedLocation: string | null;
  businessImpact: string | null;
  recommendedActions: string[];
}

export interface ExtractEmailResponse {
  result: ExtractionResult;
}
