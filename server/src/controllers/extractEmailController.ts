import type { Request, Response } from "express";
import { AppError } from "../lib/errors.js";
import { extractEmailRequestSchema } from "../schemas/email.js";
import { createEmailSource } from "../services/email-source/createEmailSource.js";
import { extractStructuredShipmentUpdate } from "../services/extraction/extractStructuredShipmentUpdate.js";

export async function extractEmailController(request: Request, response: Response) {
  const payload = extractEmailRequestSchema.parse(request.body);

  let subject: string;
  let body: string;

  if (payload.emailId) {
    const emailSource = createEmailSource();
    const email = await emailSource.getEmailById(payload.emailId);
    subject = email.subject;
    body = email.body;
  } else if (payload.subject && payload.body) {
    subject = payload.subject;
    body = payload.body;
  } else {
    throw new AppError("Missing extraction input.", 400);
  }

  const result = await extractStructuredShipmentUpdate({ subject, body });

  response.json({ result });
}
