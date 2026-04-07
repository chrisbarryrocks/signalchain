import { useCallback, useEffect, useMemo, useState } from "react";
import { getEmailById, getEmails } from "./api";
import type { EmailDetail, EmailSummary } from "./types";

export function useEmailList(enabled: boolean) {
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<EmailSummary[] | null> => {
    const response = await getEmails();
    setEmails(response.emails);
    return response.emails;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setEmails([]);
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        await load();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : "Failed to load inbox."
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [enabled, load]);

  const refetch = useCallback(async (): Promise<EmailSummary[] | null> => {
    if (!enabled) {
      return null;
    }
    setIsRefreshing(true);
    setError(null);
    try {
      return await load();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to refresh inbox."
      );
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled, load]);

  return { emails, isLoading, isRefreshing, error, refetch };
}

export function useSelectedEmail(emailId: string | null) {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!emailId) {
      setEmail(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const response = await getEmailById(emailId);
        setEmail(response.email);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : "Failed to load email."
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [emailId]);

  return useMemo(
    () => ({ email, isLoading, error }),
    [email, error, isLoading]
  );
}
