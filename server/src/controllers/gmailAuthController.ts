import crypto from "node:crypto";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { buildGmailAuthorizeUrl, exchangeCodeForTokens } from "../services/gmail/gmailOAuth.js";
import { getGmailProfileEmail } from "../services/gmail/getGmailProfile.js";
import { consumeOAuthState, registerOAuthState } from "../services/gmail/oauthState.js";
import { clearStoredTokens, loadStoredTokens, saveStoredTokens } from "../services/gmail/tokenStore.js";

function redirectWithQuery(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function extractErrorContext(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message
    };
  }
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    return {
      name: typeof obj.name === "string" ? obj.name : "UnknownError",
      message: typeof obj.message === "string" ? obj.message : "Unknown error object",
      code: typeof obj.code === "string" || typeof obj.code === "number" ? obj.code : undefined,
      status:
        typeof obj.status === "number"
          ? obj.status
          : undefined
    };
  }
  return { message: "Unknown non-object error" };
}

export function gmailAuthStartController(_request: Request, response: Response): void {
  const state = crypto.randomBytes(24).toString("hex");
  registerOAuthState(state);
  const authorizeUrl = buildGmailAuthorizeUrl(state);
  response.redirect(302, authorizeUrl);
}

export async function gmailAuthCallbackController(request: Request, response: Response): Promise<void> {
  const requestId = crypto.randomUUID().slice(0, 8);
  const base = env.OAUTH_SUCCESS_REDIRECT;
  const code = request.query.code;
  const state = request.query.state;
  const providerError = request.query.error;

  logger.info("Gmail OAuth callback received", {
    requestId,
    hasCode: typeof code === "string",
    hasState: typeof state === "string",
    hasProviderError: typeof providerError === "string"
  });

  if (typeof providerError === "string") {
    logger.warn("Gmail OAuth provider returned error", {
      requestId,
      providerError
    });
    response.redirect(302, redirectWithQuery(base, { gmail_error: providerError }));
    return;
  }

  if (typeof code !== "string") {
    logger.warn("Gmail OAuth callback missing authorization code", { requestId });
    response.redirect(302, redirectWithQuery(base, { gmail_error: "missing_code" }));
    return;
  }

  if (!consumeOAuthState(typeof state === "string" ? state : undefined)) {
    logger.warn("Gmail OAuth callback failed state validation", { requestId });
    response.redirect(302, redirectWithQuery(base, { gmail_error: "invalid_state" }));
    return;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const prior = await loadStoredTokens();
    const refreshToken = tokens.refresh_token ?? prior?.refresh_token;
    if (!refreshToken || refreshToken.length === 0) {
      response.redirect(
        302,
        redirectWithQuery(base, {
          gmail_error: "missing_refresh_token_retry_with_consent"
        })
      );
      return;
    }

    await saveStoredTokens({
      refresh_token: refreshToken,
      access_token: tokens.access_token ?? prior?.access_token,
      expiry_date: tokens.expiry_date ?? prior?.expiry_date
    });

    logger.info("Gmail OAuth callback token exchange succeeded", { requestId });
    response.redirect(302, redirectWithQuery(base, { gmail_connected: "1" }));
  } catch (error: unknown) {
    logger.error("Gmail OAuth callback token exchange failed", {
      requestId,
      ...extractErrorContext(error)
    });
    response.redirect(302, redirectWithQuery(base, { gmail_error: "token_exchange_failed" }));
  }
}

export async function gmailAuthStatusController(_request: Request, response: Response): Promise<void> {
  const stored = await loadStoredTokens();
  response.json({ connected: Boolean(stored?.refresh_token) });
}

export async function gmailAuthProfileController(_request: Request, response: Response): Promise<void> {
  const email = await getGmailProfileEmail();
  response.json({ email });
}

export async function gmailAuthDemoLoginController(_request: Request, response: Response): Promise<void> {
  const refreshToken = env.DEMO_GMAIL_REFRESH_TOKEN?.trim();
  if (!refreshToken) {
    logger.warn("Demo Gmail login attempted without configured demo refresh token");
    response.status(503).json({
      error: "Demo account is not configured on the server."
    });
    return;
  }

  await saveStoredTokens({ refresh_token: refreshToken });

  logger.info("Demo Gmail login successful");
  response.json({ connected: true });
}

export async function gmailAuthDisconnectController(_request: Request, response: Response): Promise<void> {
  await clearStoredTokens();
  response.json({ ok: true });
}
