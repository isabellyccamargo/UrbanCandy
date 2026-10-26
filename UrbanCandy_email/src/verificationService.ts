import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { Op } from 'sequelize';
import { EmailDelivery } from './models/EmailDelivery.js';
import { VerifiedEmail } from './models/VerifiedEmail.js';
import { verificationEmail } from './emailTemplates.js';
import { sequelize } from './database.js';
import { config } from './config.js';

const CODE_TTL_MS = 15 * 60 * 1000;
const RESEND_DELAY_MS = 60 * 1000;

export class EmailServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashCode(email: string, code: string): string {
  return createHmac('sha256', config.apiKey).update(`${email}:${code}`).digest('hex');
}

export async function requestEmailVerification(emailInput: string, userId: number) {
  const email = normalizeEmail(emailInput);
  if (!Number.isInteger(userId) || userId <= 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new EmailServiceError('A valid user ID and email address are required.', 400);
  }

  const existing = await VerifiedEmail.findByPk(email);
  if (existing?.verifiedAt) return { alreadyVerified: true };
  if (existing && Date.now() - existing.lastRequestedAt.getTime() < RESEND_DELAY_MS) {
    throw new EmailServiceError('Please wait before requesting another verification code.', 429);
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_TTL_MS);
  const template = verificationEmail(code);

  await sequelize.transaction(async (transaction) => {
    await VerifiedEmail.upsert(
      {
        email,
        userId,
        codeHash: hashCode(email, code),
        expiresAt,
        verifiedAt: null,
        lastRequestedAt: now,
        failedAttempts: 0,
      },
      { transaction }
    );
    await EmailDelivery.create(
      {
        eventId: randomUUID(),
        recipient: email,
        subject: template.subject,
        text: template.text,
        kind: 'verification',
        status: 'pending',
        nextAttemptAt: now,
      },
      { transaction }
    );
  });
  return { alreadyVerified: false, queued: true };
}

export async function confirmEmailVerification(emailInput: string, code: string) {
  const email = normalizeEmail(emailInput);
  const verification = await VerifiedEmail.findByPk(email);
  if (!verification || verification.verifiedAt) {
    throw new EmailServiceError('A valid pending email verification was not found.', 400);
  }
  if (verification.failedAttempts >= 5) {
    throw new EmailServiceError('Too many invalid verification codes. Request a new code.', 429);
  }
  if (verification.expiresAt.getTime() <= Date.now()) {
    throw new EmailServiceError('The verification code has expired.', 400);
  }
  const expectedHash = Buffer.from(verification.codeHash, 'hex');
  const providedHash = Buffer.from(hashCode(email, code), 'hex');
  if (
    !/^\d{6}$/.test(code) ||
    expectedHash.length !== providedHash.length ||
    !timingSafeEqual(expectedHash, providedHash)
  ) {
    verification.failedAttempts += 1;
    await verification.save();
    throw new EmailServiceError('The verification code is invalid.', 400);
  }
  verification.verifiedAt = new Date();
  verification.failedAttempts = 0;
  await verification.save();
  return { verified: true };
}

export async function isEmailVerified(emailInput: string): Promise<boolean> {
  const verification = await VerifiedEmail.findOne({
    where: { email: normalizeEmail(emailInput), verifiedAt: { [Op.ne]: null } },
  });
  return Boolean(verification);
}
