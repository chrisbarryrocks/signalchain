import { postJson } from "../../lib/http";
import type { ExtractEmailResponse } from "./types";

export function extractEmail(emailId: string) {
  return postJson<ExtractEmailResponse, { emailId: string }>("/api/extraction", {
    emailId
  });
}
