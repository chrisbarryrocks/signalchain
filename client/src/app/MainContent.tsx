import { RecommendedActionsCard } from "../components/alerts/RecommendedActionsCard";
import { RiskAlertCard } from "../components/alerts/RiskAlertCard";
import { GmailOnboarding } from "../components/auth/GmailOnboarding";
import { ExtractedDetailsCard } from "../components/extraction/ExtractedDetailsCard";
import { AnalysisResultSkeleton } from "../components/feedback/AnalysisResultSkeleton";
import { EmailDetailSkeleton } from "../components/feedback/EmailDetailSkeleton";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorState } from "../components/feedback/ErrorState";
import { EmailViewer } from "../components/inbox/EmailViewer";
import type { EmailDetail } from "../features/inbox/types";
import type { ExtractionResult } from "../features/extraction/types";

interface MainContentProps {
  connected: boolean;
  isGmailAuthLoading: boolean;
  gmailAuthError: string | null;
  oauthSurfaceError: string | null;
  isEmailListLoading: boolean;
  emailListError: string | null;
  emailCount: number;
  filteredEmailCount: number;
  isSelectedEmailLoading: boolean;
  selectedEmailId: string | null;
  selectedEmailError: string | null;
  email: EmailDetail | null;
  isExtracting: boolean;
  extractionError: string | null;
  result: ExtractionResult | null;
  hasAnalysisForEmail: (emailId: string | null | undefined) => boolean;
  onConnect: () => void;
  onTryDemoAccount: () => void;
  isDemoConnecting: boolean;
  onAnalyze: () => void;
}

export function MainContent({
  connected,
  isGmailAuthLoading,
  gmailAuthError,
  oauthSurfaceError,
  isEmailListLoading,
  emailListError,
  emailCount,
  filteredEmailCount,
  isSelectedEmailLoading,
  selectedEmailId,
  selectedEmailError,
  email,
  isExtracting,
  extractionError,
  result,
  hasAnalysisForEmail,
  onConnect,
  onTryDemoAccount,
  isDemoConnecting,
  onAnalyze
}: MainContentProps) {
  if (isGmailAuthLoading) {
    return (
      <div className="flex flex-col gap-4 py-2" role="status" aria-label="Checking Gmail">
        <div className="h-10 max-w-md animate-pulse rounded-xl bg-slate-800/50" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-800/35" />
        <div className="h-48 animate-pulse rounded-2xl bg-slate-800/30" />
      </div>
    );
  }

  if (gmailAuthError) {
    return <ErrorState message={gmailAuthError} />;
  }

  if (!connected) {
    return (
      <GmailOnboarding
        isDemoConnecting={isDemoConnecting}
        oauthSurfaceError={oauthSurfaceError}
        onConnect={onConnect}
        onTryDemoAccount={onTryDemoAccount}
      />
    );
  }

  if (isEmailListLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading inbox">
        <EmailDetailSkeleton />
      </div>
    );
  }

  if (emailListError) {
    return <ErrorState message={emailListError} />;
  }

  if (emailCount === 0) {
    return (
      <EmptyState
        body="Connect another account or change the server inbox query to see messages here."
        title="No messages to show"
      />
    );
  }

  if (filteredEmailCount === 0) {
    return (
      <EmptyState
        body="Clear the search or try different keywords to see messages again."
        title="No messages match your search"
      />
    );
  }

  if (selectedEmailId && isSelectedEmailLoading) {
    return <EmailDetailSkeleton />;
  }

  if (selectedEmailError) {
    return <ErrorState message={selectedEmailError} />;
  }

  if (!email) {
    return (
      <EmptyState
        body="Pick a row in the inbox on the left to load the full message."
        title="Select a message"
      />
    );
  }

  const hasRecommendedActions = Boolean(
    result?.recommendedActions?.some((a) => a.trim().length > 0)
  );

  return (
    <div className="space-y-6">
      <EmailViewer
        email={email}
        hasAnalysis={hasAnalysisForEmail(email.id)}
        isAnalyzing={isExtracting}
        likelyLogistics={email.likelyLogistics}
        onAnalyze={onAnalyze}
      />

      {extractionError ? <ErrorState message={extractionError} /> : null}

      {isExtracting ? <AnalysisResultSkeleton /> : null}

      {result && !isExtracting ? (
        <div
          className={
            hasRecommendedActions
              ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
              : "grid gap-6"
          }
        >
          <div className="space-y-6">
            <RiskAlertCard
              businessImpact={result.businessImpact}
              logisticsRelevant={result.logisticsRelevant}
              severity={result.severity}
              summary={result.summary}
            />
            <ExtractedDetailsCard result={result} />
          </div>
          {hasRecommendedActions ? (
            <RecommendedActionsCard actions={result.recommendedActions} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
