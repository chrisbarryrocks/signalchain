import { useCallback, useEffect, useState } from "react";
import {
  demoLoginGmail,
  disconnectGmail,
  getGmailAuthStatus,
  getGmailProfile
} from "./api";

export function useGmailConnection() {
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDemoConnecting, setIsDemoConnecting] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await getGmailAuthStatus();
      setConnected(status.connected);

      if (status.connected) {
        try {
          const profile = await getGmailProfile();
          setEmail(profile.email);
        } catch (caughtError) {
          setEmail(null);
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load connected account details."
          );
        }
      } else {
        setEmail(null);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to load Gmail connection status."
      );
      setConnected(false);
      setEmail(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const connectDemo = useCallback(async () => {
    setIsDemoConnecting(true);
    setError(null);
    try {
      await demoLoginGmail();
      await refetch();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to connect demo account."
      );
    } finally {
      setIsDemoConnecting(false);
    }
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
    email,
    isLoading,
    error,
    refetch,
    connectDemo,
    disconnect,
    isDisconnecting,
    isDemoConnecting
  };
}
