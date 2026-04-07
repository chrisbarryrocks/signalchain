import { InboxRailPlaceholder } from "../components/auth/InboxRailPlaceholder";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorState } from "../components/feedback/ErrorState";
import { InboxListSkeleton } from "../components/feedback/InboxListSkeleton";
import { EmailList } from "../components/inbox/EmailList";
import type { EmailSummary } from "../features/inbox/types";

interface SidebarContentProps {
  connected: boolean;
  isGmailAuthLoading: boolean;
  gmailAuthError: string | null;
  isEmailListLoading: boolean;
  emailListError: string | null;
  emailCount: number;
  isInboxRefreshing: boolean;
  likely: EmailSummary[];
  other: EmailSummary[];
  query: string;
  selectedEmailId: string | null;
  onQueryChange: (value: string) => void;
  onRefresh: () => void | Promise<void>;
  onSelect: (emailId: string) => void;
  onConnectRequest: () => void;
}

export function SidebarContent({
  connected,
  isGmailAuthLoading,
  gmailAuthError,
  isEmailListLoading,
  emailListError,
  emailCount,
  isInboxRefreshing,
  likely,
  other,
  query,
  selectedEmailId,
  onQueryChange,
  onRefresh,
  onSelect,
  onConnectRequest
}: SidebarContentProps) {
  if (isGmailAuthLoading) {
    return <InboxListSkeleton />;
  }

  if (gmailAuthError) {
    return (
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">
        Unable to verify Gmail status. Check the message in the main panel.
      </p>
    );
  }

  if (!connected) {
    return <InboxRailPlaceholder onConnectRequest={onConnectRequest} />;
  }

  if (isEmailListLoading) {
    return <InboxListSkeleton />;
  }

  if (emailListError) {
    return <ErrorState message={emailListError} />;
  }

  if (emailCount === 0) {
    return (
      <EmptyState
        body="No messages matched the server inbox query. Try a different account or adjust Gmail filters."
        title="Inbox is empty"
      />
    );
  }

  return (
    <EmailList
      isRefreshing={isInboxRefreshing}
      likely={likely}
      onQueryChange={onQueryChange}
      onRefresh={onRefresh}
      onSelect={onSelect}
      other={other}
      query={query}
      selectedEmailId={selectedEmailId}
    />
  );
}
