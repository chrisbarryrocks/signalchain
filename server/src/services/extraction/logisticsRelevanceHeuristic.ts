import {
  extractDelayDays,
  extractShipmentReference,
  inferCause
} from "./mockLogisticsHeuristics.js";

interface WeightedPattern {
  pattern: RegExp;
  weight: number;
}

const AUTH_SECURITY_PATTERNS: RegExp[] = [
  /\b2[\s-]*step\s+verification\b/i,
  /\b2fa\b/i,
  /\bmfa\b/i,
  /\bsecurity\s+alert\b/i,
  /\bpassword\s+reset\b/i,
  /\breset\s+your\s+password\b/i,
  /\bverify\s+your\s+(account|email)\b/i,
  /\bverification\s+code\b/i,
  /\bone[\s-]*time\s+passcode\b/i,
  /\bsign[\s-]*in\s+attempt\b/i,
  /\bnew\s+sign[\s-]*in\b/i,
  /\bsuspicious\s+login\b/i,
  /\baccount\s+recovery\b/i,
  /\bunauthorized\s+access\b/i,
  /\bprotect\s+your\s+account\b/i
];

const MARKETING_PATTERNS: RegExp[] = [
  /\bunsubscribe\b/i,
  /\bnewsletter\b/i,
  /\bpromotional?\b/i,
  /\bmarketing\b/i,
  /\bdeal\b/i,
  /\bdiscount\b/i,
  /\b50%\s*off\b/i,
  /\bshop\s+now\b/i,
  /\blimited\s+time\b/i,
  /\bview\s+this\s+email\s+in\s+your\s+browser\b/i
];

const NEGATIVE_SENDER_PATTERNS: RegExp[] = [
  /\bsecurity\b/i,
  /\bauth\b/i,
  /\bno[-_.]?reply\b/i,
  /\baccounts?\b/i,
  /@(google|microsoft|apple|linkedin|meta)\./i
];

const STRONG_POSITIVE_PATTERNS: WeightedPattern[] = [
  { pattern: /\bshipment\b/i, weight: 4 },
  { pattern: /\bcontainer\b/i, weight: 4 },
  { pattern: /\bfreight\b/i, weight: 4 },
  { pattern: /\bcargo\b/i, weight: 4 },
  { pattern: /\b(?:bol|b\/l)\b/i, weight: 5 },
  { pattern: /\bawb\b/i, weight: 5 },
  { pattern: /\bpro\s*#?\b/i, weight: 4 },
  { pattern: /\bcustoms\b/i, weight: 4 },
  { pattern: /\bdrayage\b/i, weight: 4 },
  { pattern: /\bchassis\b/i, weight: 4 },
  { pattern: /\bcarrier\b/i, weight: 3 },
  { pattern: /\b3pl\b/i, weight: 3 }
];

const OPERATIONS_PATTERNS: WeightedPattern[] = [
  { pattern: /\bdispatch\b/i, weight: 2 },
  { pattern: /\bwarehouse\b/i, weight: 2 },
  { pattern: /\bdistribution\s+center\b/i, weight: 3 },
  { pattern: /\boutbound\b/i, weight: 2 },
  { pattern: /\binbound\b/i, weight: 2 },
  { pattern: /\ballocation\b/i, weight: 2 },
  { pattern: /\bappointment\b/i, weight: 2 },
  { pattern: /\btrailer\b/i, weight: 2 },
  { pattern: /\bterminal\b/i, weight: 2 },
  { pattern: /\bport\b/i, weight: 2 },
  { pattern: /\bcongestion\b/i, weight: 2 },
  { pattern: /\bdelay(ed|s)?\b/i, weight: 2 },
  { pattern: /\beta\b/i, weight: 1 },
  { pattern: /\bfulfill(?:ment)?\b/i, weight: 2 },
  { pattern: /\bvendor\b/i, weight: 2 }
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function testAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((total, pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text) ? total + 1 : total;
  }, 0);
}

function scoreWeightedPatterns(
  subject: string,
  combined: string,
  weightedPatterns: WeightedPattern[]
): { score: number; matches: number } {
  let score = 0;
  let matches = 0;
  for (const item of weightedPatterns) {
    item.pattern.lastIndex = 0;
    if (item.pattern.test(combined)) {
      matches += 1;
      score += item.weight;

      // Subject hits are stronger for inbox triage.
      item.pattern.lastIndex = 0;
      if (item.pattern.test(subject)) {
        score += Math.ceil(item.weight / 2);
      }
    }
  }
  return { score, matches };
}

function hasReferenceLikeToken(text: string): boolean {
  return /\b(?:po|p\.o\.|order|container|shipment|load|bol|awb)\s*#?\s*[a-z0-9-]{3,}\b/i.test(
    text
  );
}

export function isLikelyLogisticsEmailMock(
  subject: string,
  bodyOrSnippet: string,
  sender = ""
): boolean {
  const normalizedSubject = normalize(subject);
  const normalizedBodyOrSnippet = normalize(bodyOrSnippet);
  const normalizedSender = normalize(sender);
  const combined = `${normalizedSubject}\n${normalizedBodyOrSnippet}`;

  let structuredScore = 0;
  if (extractShipmentReference(subject, bodyOrSnippet) !== null) {
    structuredScore += 10;
  }
  if (extractDelayDays(combined) !== null) {
    structuredScore += 6;
  }
  if (inferCause(combined) !== null) {
    structuredScore += 5;
  }
  if (hasReferenceLikeToken(combined)) {
    structuredScore += 4;
  }

  const strongPositives = scoreWeightedPatterns(
    normalizedSubject,
    combined,
    STRONG_POSITIVE_PATTERNS
  );
  const operations = scoreWeightedPatterns(normalizedSubject, combined, OPERATIONS_PATTERNS);
  let positiveScore = structuredScore + strongPositives.score + operations.score;

  // Co-occurrence bonuses reduce false positives from isolated generic words.
  if (strongPositives.matches >= 2) {
    positiveScore += 3;
  }
  if (testAny(combined, [/\beta\b/i, /\bdelay(ed|s)?\b/i]) && testAny(combined, [/\bpo\b/i, /\border\b/i, /\bcontainer\b/i, /\bload\b/i])) {
    positiveScore += 3;
  }

  const authCount = countMatches(combined, AUTH_SECURITY_PATTERNS);
  const marketingCount = countMatches(combined, MARKETING_PATTERNS);
  const senderNegativeCount = countMatches(normalizedSender, NEGATIVE_SENDER_PATTERNS);
  const negativeScore = authCount * 10 + marketingCount * 6 + senderNegativeCount * 3;

  // Hard suppression: auth/security and system account notices should not land in Relevant
  // unless there is overwhelming logistics evidence.
  const hasAuthSecuritySignal =
    authCount > 0 ||
    /\b(account|security|verification|password)\b/.test(normalizedSubject) ||
    /\bno[-_.]?reply\b/.test(normalizedSender);
  const hasOverwhelmingLogisticsEvidence = structuredScore >= 10 && strongPositives.matches >= 2;

  if (hasAuthSecuritySignal && !hasOverwhelmingLogisticsEvidence) {
    return false;
  }
  if (marketingCount >= 2 && structuredScore < 10) {
    return false;
  }

  const finalScore = positiveScore - negativeScore;
  return finalScore >= 8 && (strongPositives.matches >= 1 || structuredScore >= 6);
}
