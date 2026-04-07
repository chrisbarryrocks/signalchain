import { useCallback, useEffect, useMemo, useState } from "react";
import { EmailList } from "../components/inbox/EmailList";
import { AppShell } from "../components/layout/AppShell";
import { Header } from "../components/layout/Header";
import { useGmailConnection } from "../features/auth/useGmailConnection";
import { useOAuthCallback } from "../features/auth/useOAuthCallback";
import { useExtraction } from "../features/extraction/hooks";
import { useEmailList, useSelectedEmail } from "../features/inbox/hooks";
import {
  filterEmailsBySearch,
  orderedVisibleIds,
  partitionLikelyOther
} from "../features/inbox/inboxSearch";
import { API_BASE_URL } from "../lib/http";
import { MainContent } from "./MainContent";

export function App() {
  const {
    connected,
    email: connectedEmail,
    isLoading: isGmailAuthLoading,
    error: gmailAuthError,
    refetch: refetchGmail,
    connectDemo,
    disconnect,
    isDisconnecting,
    isDemoConnecting
  } = useGmailConnection();

  const inboxEnabled = connected && !isGmailAuthLoading;
  const {
    emails,
    error: emailListError,
    isLoading: isEmailListLoading,
    isRefreshing: isInboxRefreshing,
    refetch: refetchInbox
  } = useEmailList(inboxEnabled);

  const [inboxQuery, setInboxQuery] = useState("");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [oauthSurfaceError, setOauthSurfaceError] = useState<string | null>(null);

  useOAuthCallback({
    onConnected: () => void refetchGmail(),
    onError: setOauthSurfaceError
  });

  const filteredEmails = useMemo(
    () => filterEmailsBySearch(emails, inboxQuery),
    [emails, inboxQuery]
  );

  const { likely: likelyFiltered, other: otherFiltered } = useMemo(
    () => partitionLikelyOther(filteredEmails),
    [filteredEmails]
  );

  const visibleIds = useMemo(
    () => orderedVisibleIds(likelyFiltered, otherFiltered),
    [likelyFiltered, otherFiltered]
  );

  const {
    email,
    error: selectedEmailError,
    isLoading: isSelectedEmailLoading
  } = useSelectedEmail(inboxEnabled ? selectedEmailId : null);

  const {
    result,
    error: extractionError,
    isLoading: isExtracting,
    reset,
    runExtraction,
    hasAnalysisForEmail
  } = useExtraction();

  const startGmailOAuth = useCallback(() => {
    window.location.assign(`${API_BASE_URL}/api/auth/gmail/start`);
  }, []);

  const handleInboxRefresh = useCallback(async () => {
    const next = await refetchInbox();
    if (!next) {
      return;
    }
    setSelectedEmailId((prev) => {
      if (prev === null) return prev;
      return next.some((e) => e.id === prev) ? prev : null;
    });
  }, [refetchInbox]);

  useEffect(() => {
    if (!connected && !isGmailAuthLoading) {
      setSelectedEmailId(null);
    }
  }, [connected, isGmailAuthLoading]);

  useEffect(() => {
    if (!inboxEnabled) {
      return;
    }
    if (visibleIds.length === 0) {
      if (selectedEmailId !== null) {
        setSelectedEmailId(null);
      }
      return;
    }
    const visible = new Set(visibleIds);
    if (selectedEmailId === null || !visible.has(selectedEmailId)) {
      const firstId = visibleIds[0];
      if (firstId !== undefined) {
        setSelectedEmailId(firstId);
      }
    }
  }, [inboxEnabled, selectedEmailId, visibleIds]);

  useEffect(() => {
    reset();
  }, [selectedEmailId, reset]);

  return (
    <AppShell
      header={
        <Header
          connectedEmail={connectedEmail}
          disconnectDisabled={isDisconnecting}
          gmailConnected={connected}
          onDisconnect={() => void disconnect()}
        />
      }
      main={
        <MainContent
          connected={connected}
          email={email}
          emailCount={emails.length}
          emailListError={emailListError}
          extractionError={extractionError}
          filteredEmailCount={filteredEmails.length}
          gmailAuthError={gmailAuthError}
          hasAnalysisForEmail={hasAnalysisForEmail}
          isDemoConnecting={isDemoConnecting}
          isEmailListLoading={isEmailListLoading}
          isExtracting={isExtracting}
          isGmailAuthLoading={isGmailAuthLoading}
          isSelectedEmailLoading={isSelectedEmailLoading}
          oauthSurfaceError={oauthSurfaceError}
          onAnalyze={() => email && void runExtraction(email.id)}
          onConnect={startGmailOAuth}
          onTryDemoAccount={() => void connectDemo()}
          result={result}
          selectedEmailError={selectedEmailError}
          selectedEmailId={selectedEmailId}
        />
      }
      sidebar={
        connected ? (
          <EmailList
            isRefreshing={isInboxRefreshing}
            likely={likelyFiltered}
            onQueryChange={setInboxQuery}
            onRefresh={handleInboxRefresh}
            onSelect={setSelectedEmailId}
            other={otherFiltered}
            query={inboxQuery}
            selectedEmailId={selectedEmailId}
          />
        ) : undefined
      }
    />
  );
}
