export interface EmailSummary {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  likelyLogistics: boolean;
}

export interface EmailDetail extends EmailSummary {
  body: string;
}

export interface ExtractionResult {
  logisticsRelevant: boolean;
  shipmentReference: string | null;
  issueType: string;
  severity: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  summary: string;
  cause: string | null;
  delayDays: number | null;
  updatedEta: string | null;
  impactedLocation: string | null;
  businessImpact: string | null;
  recommendedActions: string[];
}
