const MAX_BODY_CHARS = 6_000;

interface BuildExtractionPromptParams {
  subject: string;
  body: string;
}

export function buildExtractionPrompt({
  subject,
  body
}: BuildExtractionPromptParams): string {
  const truncatedBody =
    body.length > MAX_BODY_CHARS
      ? `${body.slice(0, MAX_BODY_CHARS)}\n[…body truncated]`
      : body;

  return [
    "Extract structured logistics risk information from the following vendor email.",
    "Return JSON only with the requested fields.",
    "",
    `Subject: ${subject}`,
    "",
    "Body:",
    truncatedBody
  ].join("\n");
}
