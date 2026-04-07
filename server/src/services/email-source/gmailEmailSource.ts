import { getEmailById } from "../gmail/getEmailById.js";
import { listRelevantEmails } from "../gmail/listRelevantEmails.js";
import type { EmailSource } from "./types.js";

export class GmailEmailSource implements EmailSource {
  public listEmails() {
    return listRelevantEmails();
  }

  public getEmailById(emailId: string) {
    return getEmailById(emailId);
  }
}
