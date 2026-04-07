import { AppError } from "../../lib/errors.js";

function getHttpStatus(error: unknown): number | undefined {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { status?: unknown } }).response;
    if (response && typeof response.status === "number") {
      return response.status;
    }
  }
  return undefined;
}

export function mapGmailApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const status = getHttpStatus(error);
  const message = error instanceof Error ? error.message : "Gmail API request failed.";

  if (status === 404) {
    return new AppError("Email not found.", 404);
  }

  if (status === 401 || status === 403) {
    return new AppError(
      message || "Gmail API rejected the request. Reconnect Gmail if your token was revoked.",
      status
    );
  }

  if (status !== undefined && status >= 400 && status < 500) {
    return new AppError(message, status);
  }

  return new AppError(message, status && status >= 500 ? status : 502);
}
