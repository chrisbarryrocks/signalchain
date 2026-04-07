import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { extractEmailController } from "../controllers/extractEmailController.js";

export const extractionRouter = Router();

extractionRouter.post("/", asyncHandler(extractEmailController));
