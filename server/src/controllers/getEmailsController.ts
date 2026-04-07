import type { Request, Response } from "express";
import { createEmailSource } from "../services/email-source/createEmailSource.js";

export async function getEmailsController(_req: Request, response: Response) {
  const emailSource = createEmailSource();
  const emails = await emailSource.listEmails();
  response.json({ emails });
}
