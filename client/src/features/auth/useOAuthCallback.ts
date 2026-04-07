import { useEffect } from "react";

interface UseOAuthCallbackOptions {
  onConnected: () => void;
  onError: (code: string) => void;
}

/**
 * Reads OAuth result query params from the URL on mount, surfaces them to
 * the caller, then strips them from the history so they do not persist on
 * page reload.
 */
export function useOAuthCallback({ onConnected, onError }: UseOAuthCallbackOptions): void {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let dirty = false;

    if (params.get("gmail_connected") === "1") {
      params.delete("gmail_connected");
      dirty = true;
      onConnected();
    }

    const oauthErr = params.get("gmail_error");
    if (oauthErr) {
      onError(oauthErr);
      params.delete("gmail_error");
      dirty = true;
    }

    if (dirty) {
      const next = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${next ? `?${next}` : ""}`
      );
    }
    // Run once on mount only; URL params do not change after initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
