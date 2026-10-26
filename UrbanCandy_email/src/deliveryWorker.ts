import { Op } from 'sequelize';
import { EmailDelivery } from './models/EmailDelivery.js';
import { sendMail, type MailSender } from './mailer.js';

const MAX_BACKOFF_MS = 60 * 60 * 1000;
const LEASE_MS = 2 * 60 * 1000;
const inFlight = new Set<number>();

export function createDeliveryProcessor(sender: MailSender) {
  return async (delivery: EmailDelivery) => {
    if (inFlight.has(delivery.id)) return;
    inFlight.add(delivery.id);
    try {
      delivery.status = 'sending';
      delivery.attempts += 1;
      delivery.nextAttemptAt = new Date(Date.now() + LEASE_MS);
      await delivery.save();

      await sender({
        to: delivery.recipient,
        subject: delivery.subject,
        text: delivery.text,
      });

      delivery.status = 'sent';
      delivery.lastError = null;
      if (delivery.kind === 'verification') delivery.text = '';
      await delivery.save();
      console.info(`[email-service] Sent delivery id=${delivery.id} kind=${delivery.kind}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      delivery.status = 'pending';
      delivery.lastError = message.slice(0, 2000);
      const backoff = Math.min(1000 * 2 ** Math.min(delivery.attempts, 12), MAX_BACKOFF_MS);
      delivery.nextAttemptAt = new Date(Date.now() + backoff);
      await delivery.save();
      console.error(`[email-service] Delivery id=${delivery.id} failed; retry scheduled.`, error);
    } finally {
      inFlight.delete(delivery.id);
    }
  };
}

const processDelivery = createDeliveryProcessor(sendMail);

export async function processPendingDeliveries(): Promise<void> {
  const now = new Date();
  const deliveries = await EmailDelivery.findAll({
    where: {
      [Op.or]: [
        { status: 'pending', nextAttemptAt: { [Op.lte]: now } },
        { status: 'sending', nextAttemptAt: { [Op.lte]: now } },
      ],
    },
    order: [['id', 'ASC']],
    limit: 20,
  });
  await Promise.all(deliveries.map(processDelivery));
}

export function startDeliveryWorker(): NodeJS.Timeout {
  const timer = setInterval(() => {
    void processPendingDeliveries().catch((error: unknown) => {
      console.error('[email-service] Failed to poll queued deliveries:', error);
    });
  }, 1000);
  timer.unref();
  return timer;
}
