import OpenAI from "openai";
import { z } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { extractionResultSchema } from "../../schemas/extraction.js";
import { deriveRecommendedActions } from "../risk/deriveRecommendedActions.js";
import { buildExtractionPrompt } from "./buildExtractionPrompt.js";
import { modelExtractionBaseSchema } from "./modelExtractionParse.js";
import { buildNonLogisticsBase } from "./nonLogisticsExtraction.js";

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AppError("OPENAI_API_KEY is required when USE_MOCK=false.", 500);
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

const rawResponseEnvelopeSchema = z
  .object({
    logisticsRelevant: z.preprocess((value) => {
      if (value === undefined || value === null) {
        return true;
      }
      if (value === true || value === false) {
        return value;
      }
      if (typeof value === "string") {
        const t = value.trim().toLowerCase();
        if (["true", "yes", "1"].includes(t)) {
          return true;
        }
        if (["false", "no", "0"].includes(t)) {
          return false;
        }
      }
      return true;
    }, z.boolean()),
    summary: z.union([z.string(), z.null()]).optional()
  })
  .passthrough();

interface Input {
  subject: string;
  body: string;
}

export async function openAiExtractStructuredShipmentUpdate({
  subject,
  body
}: Input) {
  const prompt = buildExtractionPrompt({ subject, body });

  let content: string | null;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: env.OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You classify and extract logistics/vendor operations signals from email.",
            "Return one JSON object only. Do not include recommendedActions.",
            "",
            "Step 1 — Set logisticsRelevant to true only if the message plausibly concerns shipping, freight,",
            "warehousing, purchase orders, containers, customs, carriers, ETAs/delays, inventory movement,",
            "or similar vendor/operations logistics. Set it to false for personal mail, marketing, HR/IT,",
            "newsletters, meeting invites, social notifications, or any content with no meaningful logistics hook.",
            "",
            "When logisticsRelevant is false:",
            "- Do not invent shipment references, vendors, locations, delays, or business impacts.",
            "- Set issueType to \"non_logistics\", severity \"low\", confidence \"high\".",
            "- Set shipmentReference, cause, delayDays, updatedEta, impactedLocation, and businessImpact to null.",
            "- summary: one or two sentences explaining that the message is out of scope (no fabricated logistics details).",
            "",
            "When logisticsRelevant is true:",
            "- Extract only what the text supports; use null when unknown.",
            "- Never invent reference numbers or named locations not grounded in the email."
          ].join("\n")
        },
        {
          role: "user",
          content: [
            prompt,
            "",
            "Required JSON fields:",
            "- logisticsRelevant: boolean",
            "- shipmentReference: string | null",
            "- issueType: string",
            "- severity: low | medium | high",
            "- confidence: low | medium | high",
            "- summary: string",
            "- cause: string | null",
            "- delayDays: integer | null",
            "- updatedEta: string | null",
            "- impactedLocation: string | null",
            "- businessImpact: string | null"
          ].join("\n")
        }
      ]
    });

    content = response.choices[0]?.message?.content ?? null;
  } catch (error: unknown) {
    if (error instanceof OpenAI.APIError) {
      const status =
        typeof error.status === "number" && error.status >= 400 && error.status < 600
          ? error.status
          : 502;
      throw new AppError(error.message || "OpenAI request failed.", status);
    }
    throw error;
  }

  if (!content) {
    throw new AppError("OpenAI returned an empty extraction response.", 502);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJsonPayload(content)) as unknown;
  } catch {
    throw new AppError("OpenAI returned invalid JSON.", 502);
  }

  const envelope = rawResponseEnvelopeSchema.parse(parsedJson);

  if (!envelope.logisticsRelevant) {
    const summaryOverride =
      typeof envelope.summary === "string" && envelope.summary.trim().length > 0
        ? envelope.summary
        : null;
    const base = buildNonLogisticsBase(summaryOverride);
    return extractionResultSchema.parse({
      ...base,
      recommendedActions: deriveRecommendedActions(base)
    });
  }

  const { logisticsRelevant: _lr, ...rest } = envelope;
  const { recommendedActions: _ra, ...withoutActions } = rest as Record<string, unknown> & {
    recommendedActions?: unknown;
  };

  const base = modelExtractionBaseSchema.parse(withoutActions);
  const fullBase = { ...base, logisticsRelevant: true as const };

  return extractionResultSchema.parse({
    ...fullBase,
    recommendedActions: deriveRecommendedActions(fullBase)
  });
}
