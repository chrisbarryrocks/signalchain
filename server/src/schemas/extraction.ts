import { z } from "zod";

export const extractionResultSchema = z.object({
  logisticsRelevant: z.boolean(),
  shipmentReference: z.string().nullable(),
  issueType: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  confidence: z.enum(["low", "medium", "high"]),
  summary: z.string(),
  cause: z.string().nullable(),
  delayDays: z.number().int().nullable(),
  updatedEta: z.string().nullable(),
  impactedLocation: z.string().nullable(),
  businessImpact: z.string().nullable(),
  recommendedActions: z.array(z.string()).min(1)
});

export type ExtractionResultSchema = z.infer<typeof extractionResultSchema>;
