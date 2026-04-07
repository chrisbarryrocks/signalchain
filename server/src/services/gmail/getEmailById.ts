import { AppError } from "../../lib/errors.js";
import { normalizeText } from "../../utils/normalizeText.js";
import { parseEmailBody } from "../../utils/parseEmailBody.js";
import type { EmailDetail } from "../../types/api.js";
import { isLikelyLogisticsEmailMock } from "../extraction/logisticsRelevanceHeuristic.js";
import { getGmailClient } from "./gmailClient.js";
import { getHeader } from "./gmailUtils.js";
import { mapGmailApiError } from "./mapGmailError.js";

export async function getEmailById(emailId: string): Promise<EmailDetail> {
  try {
    const gmail = await getGmailClient();
    const response = await gmail.users.messages.get({
      userId: "me",
      id: emailId,
      format: "full"
    });

    if (!response.data.id || !response.data.payload) {
      throw new AppError("Email not found.", 404);
    }

    const headers = response.data.payload.headers ?? [];
    const parsedBody = parseEmailBody(response.data.payload);
    const snippet = response.data.snippet ?? "";
    const body =
      parsedBody.trim().length > 0
        ? parsedBody
        : snippet.trim().length > 0
          ? normalizeText(snippet)
          : "(No body available.)";

    const subject = getHeader(headers, "subject") || "(No subject)";
    const from = getHeader(headers, "from") || "Unknown sender";

    return {
      id: response.data.id,
      subject,
      from,
      date: new Date(Number(response.data.internalDate ?? Date.now())).toISOString(),
      snippet,
      body,
      likelyLogistics: isLikelyLogisticsEmailMock(subject, body, from)
    };
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    throw mapGmailApiError(error);
  }
}
