import { useCallback, useState } from "react";
import { extractEmail } from "./api";
import type { ExtractionResult } from "./types";

export function useExtraction() {
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedByEmailId, setAnalyzedByEmailId] = useState<Record<string, true>>({});

  const runExtraction = useCallback(async (emailId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await extractEmail(emailId);
      setResult(response.result);
      setAnalyzedByEmailId((prev) => ({ ...prev, [emailId]: true }));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to analyze selected email."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const hasAnalysisForEmail = useCallback(
    (emailId: string | null | undefined): boolean =>
      Boolean(emailId && analyzedByEmailId[emailId]),
    [analyzedByEmailId]
  );

  return {
    result,
    isLoading,
    error,
    runExtraction,
    reset,
    hasAnalysisForEmail
  };
}
