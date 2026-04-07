import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { env, SERVER_PACKAGE_ROOT } from "../../config/env.js";

export interface StoredGmailTokens {
  refresh_token: string;
  access_token?: string;
  expiry_date?: number | null;
}

function tokenFilePath(): string {
  const file = env.GMAIL_TOKEN_FILE;
  return path.isAbsolute(file) ? file : path.resolve(SERVER_PACKAGE_ROOT, file);
}

export async function loadStoredTokens(): Promise<StoredGmailTokens | null> {
  try {
    const raw = await readFile(tokenFilePath(), "utf8");
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
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? (error as NodeJS.ErrnoException).code : undefined;
    if (code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function saveStoredTokens(tokens: StoredGmailTokens): Promise<void> {
  const target = tokenFilePath();
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
}

export async function clearStoredTokens(): Promise<void> {
  try {
    await unlink(tokenFilePath());
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? (error as NodeJS.ErrnoException).code : undefined;
    if (code !== "ENOENT") {
      throw error;
    }
  }
}
