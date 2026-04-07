import { getJson, postJson } from "../../lib/http";

export interface GmailAuthStatusResponse {
  connected: boolean;
}

export interface GmailProfileResponse {
  email: string;
}

export function getGmailAuthStatus() {
  return getJson<GmailAuthStatusResponse>("/api/auth/gmail/status");
}

export function getGmailProfile() {
  return getJson<GmailProfileResponse>("/api/auth/gmail/profile");
}

export function demoLoginGmail() {
  return postJson<{ connected: boolean }, Record<string, never>>(
    "/api/auth/gmail/demo-login",
    {}
  );
}

export function disconnectGmail() {
  return postJson<{ ok: boolean }, Record<string, never>>("/api/auth/gmail/disconnect", {});
}
