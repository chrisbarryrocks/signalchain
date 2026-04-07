import { google } from "googleapis";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { loadStoredTokens } from "./tokenStore.js";

export async function getGmailClient() {
  const stored = await loadStoredTokens();
  if (!stored?.refresh_token) {
    throw new AppError(
      "Gmail is not connected. Use Connect Gmail in the app to sign in.",
      401
    );
  }

  const oauth2 = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.OAUTH_REDIRECT_URI
  );

  oauth2.setCredentials({
    refresh_token: stored.refresh_token,
    access_token: stored.access_token,
    expiry_date: stored.expiry_date ?? undefined
  });

  return google.gmail({ version: "v1", auth: oauth2 });
}
