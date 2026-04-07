import type { EmailDetail, EmailSummary } from "../../types/api.js";

export interface EmailSource {
  listEmails(): Promise<EmailSummary[]>;
  getEmailById(emailId: string): Promise<EmailDetail>;
}
