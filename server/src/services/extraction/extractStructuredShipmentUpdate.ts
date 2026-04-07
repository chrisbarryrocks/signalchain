import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { mockExtractStructuredShipmentUpdate } from "./mockExtractStructuredShipmentUpdate.js";

interface Input {
  subject: string;
  body: string;
}

/**
 * Real extraction uses OpenAI when `USE_MOCK=false` (requires `OPENAI_API_KEY`).
 * Mock heuristics are the explicit fallback when `USE_MOCK=true`.
 */
export async function extractStructuredShipmentUpdate(input: Input) {
  if (env.EXTRACTION_DEBUG) {
    logger.info("Extraction request", {
      mode: env.USE_MOCK ? "mock" : "openai",
      model: env.USE_MOCK ? null : env.OPENAI_MODEL,
      subjectPreview: input.subject.slice(0, 120)
    });
  }

  if (env.USE_MOCK) {
    return mockExtractStructuredShipmentUpdate(input.subject, input.body);
  }

  const { openAiExtractStructuredShipmentUpdate } = await import(
    "./openAiExtractStructuredShipmentUpdate.js"
  );
  return openAiExtractStructuredShipmentUpdate(input);
}
