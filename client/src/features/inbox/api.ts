import { getJson } from "../../lib/http";
import type { GetEmailResponse, GetEmailsResponse } from "./types";

export function getEmails() {
  return getJson<GetEmailsResponse>("/api/emails");
}

export function getEmailById(emailId: string) {
  return getJson<GetEmailResponse>(`/api/emails/${emailId}`);
}
