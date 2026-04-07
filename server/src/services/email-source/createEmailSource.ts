import type { EmailSource } from "./types.js";
import { GmailEmailSource } from "./gmailEmailSource.js";

export function createEmailSource(): EmailSource {
  return new GmailEmailSource();
}
