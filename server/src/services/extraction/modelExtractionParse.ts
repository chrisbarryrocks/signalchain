import { z } from "zod";

const tierSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.enum(["low", "medium", "high"])
);

function nullableTrimmedString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

const nullableStringField = z.preprocess(nullableTrimmedString, z.string().nullable());

function delayDaysFromUnknown(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  return null;
}

const delayDaysField = z.preprocess(delayDaysFromUnknown, z.number().int().nullable());

export const modelExtractionBaseSchema = z.object({
  shipmentReference: nullableStringField,
  issueType: z.preprocess((value) => {
    const s = typeof value === "string" ? value.trim() : String(value ?? "").trim();
    return s.length > 0 ? s : "logistics_update";
  }, z.string().min(1)),
  severity: tierSchema,
  confidence: tierSchema,
  summary: z.preprocess((value) => {
    const s = typeof value === "string" ? value.trim() : String(value ?? "").trim();
    return s.length > 0 ? s : "Vendor update received; details could not be summarized.";
  }, z.string().min(1)),
  cause: nullableStringField,
  delayDays: delayDaysField,
  updatedEta: nullableStringField,
  impactedLocation: nullableStringField,
  businessImpact: nullableStringField
});

export type ModelExtractionBase = z.infer<typeof modelExtractionBaseSchema>;
