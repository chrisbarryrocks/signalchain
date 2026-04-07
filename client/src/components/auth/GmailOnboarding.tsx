interface GmailOnboardingProps {
  oauthSurfaceError: string | null;
  onConnect: () => void;
  onTryDemoAccount: () => void;
  isDemoConnecting?: boolean;
}

const features = [
  {
    icon: "✉",
    title: "Inbox",
    description: "Read vendor messages and logistics threads from Gmail"
  },
  {
    icon: "⚡",
    title: "Extract",
    description: "Classify risk, detect severity, and pull shipment details"
  },
  {
    icon: "→",
    title: "Actions",
    description: "Surface structured next steps for your operations team"
  }
] as const;

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  missing_code: "Google did not return an authorization code. Please try again.",
  invalid_state: "The sign-in request expired. Please try again.",
  missing_refresh_token_retry_with_consent:
    "Google did not return a refresh token. Disconnect any existing access at myaccount.google.com and try again.",
  token_exchange_failed:
    "Failed to exchange the authorization code. Check your Google credentials."
};

export function GmailOnboarding({
  oauthSurfaceError,
  onConnect,
  onTryDemoAccount,
  isDemoConnecting = false
}: GmailOnboardingProps) {
  const errorMessage = oauthSurfaceError
    ? (OAUTH_ERROR_MESSAGES[oauthSurfaceError] ?? `Google sign-in error: ${oauthSurfaceError}`)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 py-6">
      {errorMessage ? (
        <div
          className="rounded-lg border border-rose-500/30 bg-rose-500/[0.08]
            px-4 py-3 text-sm text-rose-300"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--text-muted)]">
          Get started
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Connect your Gmail account
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          Securely connect your Gmail to analyze logistics updates and surface operational risks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-[var(--border-panel)] bg-[var(--bg-elevated)]
              px-4 py-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg
              bg-[var(--bg-inset)] text-base text-[var(--accent)]">
              {f.icon}
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{f.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              {f.description}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          className="inline-flex h-12 w-full items-center justify-center rounded-lg
            bg-[var(--accent)] px-6 text-sm font-semibold text-slate-950
            shadow-lg shadow-cyan-500/20 transition hover:bg-[var(--accent-hover)]
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-[var(--accent)]"
          onClick={onConnect}
          type="button"
        >
          Connect Gmail
        </button>
        <button
          className="inline-flex h-11 w-full items-center justify-center rounded-lg border
            border-[var(--border-panel)] bg-[var(--bg-inset)] px-6 text-sm font-medium
            text-[var(--text-secondary)] transition hover:border-slate-500/60 hover:bg-[var(--bg-elevated)]
            disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDemoConnecting}
          onClick={onTryDemoAccount}
          type="button"
        >
          {isDemoConnecting ? "Connecting demo account..." : "Try demo account"}
        </button>
      </div>
    </div>
  );
}
