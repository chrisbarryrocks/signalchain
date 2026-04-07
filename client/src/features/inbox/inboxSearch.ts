import type { EmailSummary } from "./types";

export function filterEmailsBySearch(
  emails: EmailSummary[],
  query: string
): EmailSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return emails;
  }
  return emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(q) ||
      e.from.toLowerCase().includes(q) ||
      e.snippet.toLowerCase().includes(q)
  );
}

export function partitionLikelyOther(emails: EmailSummary[]) {
  const likely = emails.filter((e) => e.likelyLogistics);
  const other = emails.filter((e) => !e.likelyLogistics);
  return { likely, other };
}

/** Order used for default selection when the current id is not visible (likely first, then other). */
export function orderedVisibleIds(likely: EmailSummary[], other: EmailSummary[]): string[] {
  return [...likely.map((e) => e.id), ...other.map((e) => e.id)];
}
