import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { AppError } from "./lib/errors.js";
import { logger } from "./lib/logger.js";
import { authGmailRouter } from "./routes/authGmail.js";
import { emailsRouter } from "./routes/emails.js";
import { extractionRouter } from "./routes/extraction.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: false }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api/auth/gmail", authGmailRouter);
  app.use("/api/emails", emailsRouter);
  app.use("/api/extraction", extractionRouter);

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction
    ) => {
      logger.error("Unhandled request error", {
        error: error instanceof Error ? error.message : "Unknown error"
      });

      if (error instanceof ZodError) {
        return response.status(400).json({
          error: "Invalid request payload.",
          details: error.flatten()
        });
      }

      if (error instanceof AppError) {
        return response.status(error.statusCode).json({
          error: error.message
        });
      }

      return response.status(500).json({
        error: "Internal server error."
      });
    }
  );

  return app;
}
