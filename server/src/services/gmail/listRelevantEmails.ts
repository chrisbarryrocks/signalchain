import { env } from "../../config/env.js";
import type { EmailSummary } from "../../types/api.js";
import { isLikelyLogisticsEmailMock } from "../extraction/logisticsRelevanceHeuristic.js";
import { getGmailClient } from "./gmailClient.js";
import { getHeader } from "./gmailUtils.js";
import { mapGmailApiError } from "./mapGmailError.js";

export async function listRelevantEmails(): Promise<EmailSummary[]> {
  try {
    const gmail = await getGmailClient();
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: env.GMAIL_MAX_RESULTS,
      q: env.GMAIL_LIST_QUERY
    });

    const messages = response.data.messages ?? [];

    const results = await Promise.all(
      messages.map(async (message) => {
        const id = message.id;
        if (!id) {
          return null;
        }

        const detail = await gmail.users.messages.get({
          userId: "me",
          id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"]
        });

        const headers = detail.data.payload?.headers ?? [];
        const subject = getHeader(headers, "subject") || "(No subject)";
        const from = getHeader(headers, "from") || "Unknown sender";
        const snippet = detail.data.snippet ?? "";

        return {
          id: detail.data.id ?? id,
          subject,
          from,
          date: new Date(Number(detail.data.internalDate ?? Date.now())).toISOString(),
          snippet,
          likelyLogistics: isLikelyLogisticsEmailMock(subject, snippet, from)
        } satisfies EmailSummary;
      })
    );

    return results.filter((email): email is EmailSummary => email !== null && Boolean(email.id));
  } catch (error: unknown) {
    throw mapGmailApiError(error);
  }
}
