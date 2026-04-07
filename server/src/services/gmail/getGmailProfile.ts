import { AppError } from "../../lib/errors.js";
import { getGmailClient } from "./gmailClient.js";
import { mapGmailApiError } from "./mapGmailError.js";

export async function getGmailProfileEmail(): Promise<string> {
  try {
    const gmail = await getGmailClient();
    const response = await gmail.users.getProfile({ userId: "me" });
    const email = response.data.emailAddress?.trim();
    if (!email) {
      throw new AppError("Connected account email is unavailable.", 502);
    }
    return email;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    throw mapGmailApiError(error);
  }
}
