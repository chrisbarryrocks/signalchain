import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import {
  gmailAuthCallbackController,
  gmailAuthDemoLoginController,
  gmailAuthDisconnectController,
  gmailAuthProfileController,
  gmailAuthStartController,
  gmailAuthStatusController
} from "../controllers/gmailAuthController.js";

export const authGmailRouter = Router();

authGmailRouter.get("/start", gmailAuthStartController);
authGmailRouter.get("/callback", asyncHandler(gmailAuthCallbackController));
authGmailRouter.get("/status", asyncHandler(gmailAuthStatusController));
authGmailRouter.get("/profile", asyncHandler(gmailAuthProfileController));
authGmailRouter.post("/demo-login", asyncHandler(gmailAuthDemoLoginController));
authGmailRouter.post("/disconnect", asyncHandler(gmailAuthDisconnectController));
