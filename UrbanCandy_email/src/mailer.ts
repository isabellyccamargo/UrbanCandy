import nodemailer from 'nodemailer';
import { config } from './config.js';

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

export type MailSender = (message: MailMessage) => Promise<void>;

export function createGmailSender(deliver?: MailSender): MailSender {
  const mailTransporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth:
      config.smtp.user && config.smtp.password
        ? { user: config.smtp.user, pass: config.smtp.password }
        : undefined,
  });

  return async (message) => {
    if (
      !deliver &&
      (!config.smtp.user || !config.smtp.password || !config.smtp.from)
    ) {
      throw new Error(
        'SMTP is not configured. Set SMTP_USER, SMTP_APP_PASSWORD, and SMTP_FROM.'
      );
    }
    if (deliver) {
      await deliver(message);
      return;
    }
    await mailTransporter.sendMail({
      from: config.smtp.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  };
}

export const sendMail = createGmailSender();
