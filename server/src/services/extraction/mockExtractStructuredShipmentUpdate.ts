import type { ExtractionResultSchema } from "../../schemas/extraction.js";
import { deriveRecommendedActions } from "../risk/deriveRecommendedActions.js";
import { isLikelyLogisticsEmailMock } from "./logisticsRelevanceHeuristic.js";
import { analyzeLogisticsEmailMock } from "./mockLogisticsHeuristics.js";
import { buildNonLogisticsBase } from "./nonLogisticsExtraction.js";

export async function mockExtractStructuredShipmentUpdate(
  subject: string,
  body: string
): Promise<ExtractionResultSchema> {
  if (!isLikelyLogisticsEmailMock(subject, body)) {
    const base = buildNonLogisticsBase();
    return {
      ...base,
      recommendedActions: deriveRecommendedActions(base)
    };
  }

  const base = analyzeLogisticsEmailMock(subject, body);
  return {
    ...base,
    recommendedActions: deriveRecommendedActions(base)
  };
}
