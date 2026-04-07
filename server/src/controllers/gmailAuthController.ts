import crypto from "node:crypto";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { buildGmailAuthorizeUrl, exchangeCodeForTokens } from "../services/gmail/gmailOAuth.js";
import { consumeOAuthState, registerOAuthState } from "../services/gmail/oauthState.js";
import { clearStoredTokens, loadStoredTokens, saveStoredTokens } from "../services/gmail/tokenStore.js";

function redirectWithQuery(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function gmailAuthStartController(_request: Request, response: Response): void {
  const state = crypto.randomBytes(24).toString("hex");
  registerOAuthState(state);
  const authorizeUrl = buildGmailAuthorizeUrl(state);
  response.redirect(302, authorizeUrl);
}

export async function gmailAuthCallbackController(request: Request, response: Response): Promise<void> {
  const base = env.OAUTH_SUCCESS_REDIRECT;

  if (typeof request.query.error === "string") {
    response.redirect(302, redirectWithQuery(base, { gmail_error: request.query.error }));
    return;
  }

  const code = request.query.code;
  const state = request.query.state;
  if (typeof code !== "string") {
    response.redirect(302, redirectWithQuery(base, { gmail_error: "missing_code" }));
    return;
  }

  if (!consumeOAuthState(typeof state === "string" ? state : undefined)) {
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

    response.redirect(302, redirectWithQuery(base, { gmail_connected: "1" }));
  } catch {
    response.redirect(302, redirectWithQuery(base, { gmail_error: "token_exchange_failed" }));
  }
}

export async function gmailAuthStatusController(_request: Request, response: Response): Promise<void> {
  const stored = await loadStoredTokens();
  response.json({ connected: Boolean(stored?.refresh_token) });
}

export async function gmailAuthDisconnectController(_request: Request, response: Response): Promise<void> {
  await clearStoredTokens();
  response.json({ ok: true });
}
