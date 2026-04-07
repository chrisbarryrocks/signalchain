import { getJson, postJson } from "../../lib/http";

export interface GmailAuthStatusResponse {
  connected: boolean;
}

export function getGmailAuthStatus() {
  return getJson<GmailAuthStatusResponse>("/api/auth/gmail/status");
}

export function disconnectGmail() {
  return postJson<{ ok: boolean }, Record<string, never>>("/api/auth/gmail/disconnect", {});
}
