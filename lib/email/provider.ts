import nodemailer from "nodemailer";
import { Resend } from "resend";

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

export interface EmailAdapter {
  send(payload: EmailPayload): Promise<void>;
}

class ResendAdapter implements EmailAdapter {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(payload: EmailPayload) {
    const from = process.env.EMAIL_FROM;
    if (!from) throw new Error("EMAIL_FROM is not set");
    const { error } = await this.client.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    if (error) throw new Error(error.message);
  }
}

class SmtpAdapter implements EmailAdapter {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }

  async send(payload: EmailPayload) {
    const from = process.env.EMAIL_FROM;
    if (!from) throw new Error("EMAIL_FROM is not set");
    await this.transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }
}

class LogAdapter implements EmailAdapter {
  async send(payload: EmailPayload) {
    console.info("[email:log]", payload.subject, payload.to);
  }
}

export function getEmailProvider(): EmailAdapter {
  const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();

  if (provider === "smtp") return new SmtpAdapter();
  if (provider === "log") return new LogAdapter();
  if (process.env.RESEND_API_KEY) return new ResendAdapter(process.env.RESEND_API_KEY);
  return new LogAdapter();
}

export async function sendEmail(payload: EmailPayload) {
  await getEmailProvider().send(payload);
}
