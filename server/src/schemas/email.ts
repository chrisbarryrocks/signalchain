import { z } from "zod";

export const emailSummarySchema = z.object({
  id: z.string(),
  subject: z.string(),
  from: z.string(),
  date: z.string(),
  snippet: z.string(),
  likelyLogistics: z.boolean()
});

export const emailDetailSchema = emailSummarySchema.extend({
  body: z.string()
});

export const extractEmailRequestSchema = z.object({
  emailId: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional()
}).refine(
  (value) => Boolean(value.emailId) || Boolean(value.subject && value.body),
  {
    message: "Provide either emailId or a subject/body payload."
  }
);

export type EmailSummarySchema = z.infer<typeof emailSummarySchema>;
export type EmailDetailSchema = z.infer<typeof emailDetailSchema>;
export type ExtractEmailRequestSchema = z.infer<typeof extractEmailRequestSchema>;
