export interface EmailSummary {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  likelyLogistics: boolean;
}

export interface EmailDetail extends EmailSummary {
  body: string;
}

export interface GetEmailsResponse {
  emails: EmailSummary[];
}

export interface GetEmailResponse {
  email: EmailDetail;
}
