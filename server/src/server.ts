import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./lib/logger.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info("SignalChain server started", { port: env.PORT });
  logger.info("Extraction mode", {
    mode: env.USE_MOCK ? "mock" : "openai",
    model: env.USE_MOCK ? null : env.OPENAI_MODEL,
    debug: env.EXTRACTION_DEBUG
  });
});
