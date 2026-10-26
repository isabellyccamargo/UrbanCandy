import { createClient } from 'redis';
import { config } from './config.js';
import { EmailDelivery } from './models/EmailDelivery.js';
import { orderStatusEmail } from './emailTemplates.js';
import { isEmailVerified } from './verificationService.js';

export const ORDER_STATUS_CHANNEL =
  process.env.ORDER_STATUS_CHANGED_CHANNEL || 'urbancandy:orders:status-changed';
export const ORDER_STATUS_ACK_CHANNEL =
  process.env.ORDER_STATUS_ACK_CHANNEL || 'urbancandy:orders:email-received';

type OrderStatusEvent = {
  eventId: string;
  occurredAt: string;
  orderId: number;
  previousStatusId: number;
  newStatusId: number;
  recipientUserId: number;
  recipientEmail: string;
  newStatusLabel: string;
};

function isOrderStatusEvent(value: unknown): value is OrderStatusEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<OrderStatusEvent>;
  return (
    typeof event.eventId === 'string' &&
    Number.isInteger(event.orderId) &&
    Number.isInteger(event.previousStatusId) &&
    Number.isInteger(event.newStatusId) &&
    Number.isInteger(event.recipientUserId) &&
    typeof event.recipientEmail === 'string' &&
    typeof event.newStatusLabel === 'string'
  );
}

export function createOrderStatusMessageHandler(
  persist: (event: OrderStatusEvent) => Promise<void>,
  acknowledge: (eventId: string) => Promise<void>,
  reportError: (error: unknown) => void = console.error
) {
  return async (message: string) => {
    try {
      const parsed: unknown = JSON.parse(message);
      if (!isOrderStatusEvent(parsed)) throw new Error('Invalid order status event payload.');
      await persist(parsed);
      await acknowledge(parsed.eventId);
    } catch (error) {
      reportError(error);
    }
  };
}

export async function persistOrderStatusEvent(event: OrderStatusEvent): Promise<void> {
  const email = event.recipientEmail.trim().toLowerCase();
  if (!(await isEmailVerified(email))) return;

  const template = orderStatusEmail(event.orderId, event.newStatusLabel);
  await EmailDelivery.findOrCreate({
    where: { eventId: event.eventId },
    defaults: {
      eventId: event.eventId,
      recipient: email,
      subject: template.subject,
      text: template.text,
      kind: 'order-status',
      status: 'pending',
      nextAttemptAt: new Date(),
    },
  });
}

export async function startOrderStatusConsumer(): Promise<void> {
  const subscriber = createClient({ url: config.redisUrl });
  const acknowledger = createClient({ url: config.redisUrl });
  subscriber.on('error', (error) => console.error('[email-service] Redis subscriber error:', error));
  acknowledger.on('error', (error) => console.error('[email-service] Redis publisher error:', error));
  await Promise.all([subscriber.connect(), acknowledger.connect()]);

  const handler = createOrderStatusMessageHandler(
    persistOrderStatusEvent,
    (eventId) => acknowledger.publish(ORDER_STATUS_ACK_CHANNEL, eventId).then(() => undefined),
    (error) => console.error('[email-service] Could not persist order status event:', error)
  );
  await subscriber.subscribe(ORDER_STATUS_CHANNEL, (message) => {
    void handler(message);
  });
  console.info(`[email-service] Subscribed to ${ORDER_STATUS_CHANNEL}.`);
}
