import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { getEmailController } from "../controllers/getEmailController.js";
import { getEmailsController } from "../controllers/getEmailsController.js";

export const emailsRouter = Router();

emailsRouter.get("/", asyncHandler(getEmailsController));
emailsRouter.get("/:id", asyncHandler(getEmailController));
