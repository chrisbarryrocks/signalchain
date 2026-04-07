import { useCallback, useEffect, useState } from "react";
import { disconnectGmail, getGmailAuthStatus } from "./api";

export function useGmailConnection() {
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getGmailAuthStatus();
      setConnected(response.connected);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to load Gmail connection status."
      );
      setConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const disconnect = useCallback(async () => {
    setIsDisconnecting(true);
    setError(null);
    try {
      await disconnectGmail();
      await refetch();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to disconnect Gmail."
      );
    } finally {
      setIsDisconnecting(false);
    }
  }, [refetch]);

  return {
    connected,
    isLoading,
    error,
    refetch,
    disconnect,
    isDisconnecting
  };
}
