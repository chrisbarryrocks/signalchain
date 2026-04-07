import { normalizeText } from "./normalizeText.js";

type GmailMessagePayload = {
  body?: { data?: string | null };
  mimeType?: string | null;
  parts?: GmailMessagePayload[];
};

function decodeBase64Url(value: string): string {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
    "utf8"
  );
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&#160;": " "
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&[a-z0-9#]+;/gi, (entity) => HTML_ENTITIES[entity] ?? entity);
}

function htmlToPlainText(html: string): string {
  const withoutBlocks = html
    .replace(/<\/(p|div|tr|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n");
  const withoutStyles = withoutBlocks.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  const withoutScripts = withoutStyles.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
  const withoutTags = withoutScripts.replace(/<[^>]+>/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n");
  return decodeHtmlEntities(withoutTags);
}

function collectMimeParts(
  payload: GmailMessagePayload | null | undefined,
  mimeType: string,
  out: string[]
): void {
  if (!payload) {
    return;
  }

  if (payload.mimeType?.toLowerCase() === mimeType && payload.body?.data) {
    out.push(decodeBase64Url(payload.body.data));
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      collectMimeParts(part, mimeType, out);
    }
  }
}

export function parseEmailBody(payload: GmailMessagePayload | null | undefined): string {
  const plainParts: string[] = [];
  collectMimeParts(payload, "text/plain", plainParts);
  if (plainParts.length > 0) {
    return normalizeText(plainParts.join("\n\n"));
  }

  const htmlParts: string[] = [];
  collectMimeParts(payload, "text/html", htmlParts);
  if (htmlParts.length > 0) {
    const combined = htmlParts.map((html) => htmlToPlainText(html)).join("\n\n");
    return normalizeText(combined.replace(/\n{3,}/g, "\n\n"));
  }

  if (payload?.body?.data) {
    try {
      const decoded = decodeBase64Url(payload.body.data);
      const mime = payload.mimeType?.toLowerCase() ?? "";
      if (mime.includes("html")) {
        return normalizeText(htmlToPlainText(decoded).replace(/\n{3,}/g, "\n\n"));
      }
      return normalizeText(decoded);
    } catch {
      return "";
    }
  }

  return "";
}
