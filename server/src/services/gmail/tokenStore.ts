import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { env, SERVER_PACKAGE_ROOT } from "../../config/env.js";
import { logger } from "../../lib/logger.js";

export interface StoredGmailTokens {
  refresh_token: string;
  access_token?: string;
  expiry_date?: number | null;
}

let memoryStore: StoredGmailTokens | null = null;
let seeded = false;

function seedFromEnv(): void {
  if (seeded) return;
  seeded = true;

  const refreshToken = env.GMAIL_REFRESH_TOKEN?.trim();
  if (refreshToken) {
    memoryStore = {
      refresh_token: refreshToken,
      access_token: env.GMAIL_ACCESS_TOKEN?.trim() || undefined,
      expiry_date: env.GMAIL_EXPIRY_DATE ?? undefined
    };
    logger.info("Gmail token store seeded from environment variables");
  }
}

function localDevFilePath(): string | null {
  if (!env.GMAIL_TOKEN_FILE) return null;
  const file = env.GMAIL_TOKEN_FILE;
  return path.isAbsolute(file) ? file : path.resolve(SERVER_PACKAGE_ROOT, file);
}

async function readLocalFile(filePath: string): Promise<StoredGmailTokens | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as StoredGmailTokens).refresh_token !== "string" ||
      (parsed as StoredGmailTokens).refresh_token.length === 0
    ) {
      return null;
    }
    return parsed as StoredGmailTokens;
  } catch {
    return null;
  }
}

async function writeLocalFile(filePath: string, tokens: StoredGmailTokens): Promise<void> {
  try {
    await writeFile(filePath, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as NodeJS.ErrnoException).code
        : undefined;
    logger.warn("Could not write local dev token file (non-fatal)", {
      filePath,
      errorCode: code
    });
  }
}

export async function loadStoredTokens(): Promise<StoredGmailTokens | null> {
  seedFromEnv();

  if (memoryStore) return memoryStore;

  const filePath = localDevFilePath();
  if (filePath) {
    const fromFile = await readLocalFile(filePath);
    if (fromFile) {
      memoryStore = fromFile;
      return memoryStore;
    }
  }

  return null;
}

export async function saveStoredTokens(tokens: StoredGmailTokens): Promise<void> {
  memoryStore = tokens;

  const envToken = env.GMAIL_REFRESH_TOKEN?.trim();
  if (!envToken || envToken !== tokens.refresh_token) {
    logger.info(
      "New Gmail refresh token issued. To persist this connection across restarts, " +
        "set GMAIL_REFRESH_TOKEN in your hosting environment.",
      { refresh_token: tokens.refresh_token }
    );
  }

  const filePath = localDevFilePath();
  if (filePath) {
    await writeLocalFile(filePath, tokens);
  }
}

export async function clearStoredTokens(): Promise<void> {
  memoryStore = null;

  const filePath = localDevFilePath();
  if (filePath) {
    try {
      const { unlink } = await import("node:fs/promises");
      await unlink(filePath);
    } catch {
    }
  }
}
