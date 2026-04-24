import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const configDir = path.dirname(fileURLToPath(import.meta.url));

export const SERVER_PACKAGE_ROOT = path.resolve(configDir, "..", "..");

dotenv.config({ path: path.join(SERVER_PACKAGE_ROOT, ".env") });
dotenv.config({ path: path.join(SERVER_PACKAGE_ROOT, ".env.local") });

const baseSchema = z.object({
  PORT: z.coerce.number().default(4000),
  USE_MOCK: z
    .enum(["true", "false"])
    .default("true")
    .transform((value): boolean => value === "true"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  EXTRACTION_DEBUG: z
    .enum(["true", "false"])
    .default("false")
    .transform((value): boolean => value === "true"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  OAUTH_REDIRECT_URI: z.string().url().optional(),
  OAUTH_SUCCESS_REDIRECT: z.string().url().default("http://localhost:5173/"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  DEMO_GMAIL_REFRESH_TOKEN: z.string().optional(),
  GMAIL_TOKEN_FILE: z.string().optional(),
  GMAIL_LIST_QUERY: z.string().default("in:inbox newer_than:14d"),
  GMAIL_MAX_RESULTS: z.coerce.number().int().min(1).max(100).default(25)
});

const parsed = baseSchema.parse(process.env);

if (!parsed.USE_MOCK && !parsed.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required when USE_MOCK=false.");
}

export const env = {
  ...parsed,
  OAUTH_REDIRECT_URI:
    parsed.OAUTH_REDIRECT_URI ??
    `http://localhost:${parsed.PORT}/api/auth/gmail/callback`
};
