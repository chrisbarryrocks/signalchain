import type { Request, Response } from "express";
import { createEmailSource } from "../services/email-source/createEmailSource.js";

export const getEmailController = async (request: Request, response: Response) => {
  const param = request.params.id;
  // Express v5 types `params` values as `string | string[]`; normalise to scalar.
  const emailId = Array.isArray(param) ? param[0] : param;

  if (!emailId) {
    return response.status(400).json({ error: "Email id is required" });
  }

  const emailSource = createEmailSource();
  const email = await emailSource.getEmailById(emailId);

  return response.json({ email });
};
