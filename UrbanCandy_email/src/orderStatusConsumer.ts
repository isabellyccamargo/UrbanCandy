import { createClient } from 'redis';
import { config } from './config.js';
import { EmailDelivery } from './models/EmailDelivery.js';
import { orderCreatedEmail, orderStatusEmail } from './emailTemplates.js';
import { isEmailVerified } from './verificationService.js';

export const ORDER_STATUS_CHANNEL =
  process.env.ORDER_STATUS_CHANGED_CHANNEL || 'urbancandy:orders:status-changed';
export const ORDER_CREATED_CHANNEL =
  process.env.ORDER_CREATED_CHANNEL || 'urbancandy:orders:created';
export const ORDER_STATUS_ACK_CHANNEL =
  process.env.ORDER_STATUS_ACK_CHANNEL || 'urbancandy:orders:email-received';

type OrderEventBase = {
  eventId: string;
  occurredAt: string;
  orderId: number;
  recipientUserId: number;
  recipientEmail: string;
};

type OrderStatusEvent = OrderEventBase & {
  eventType?: 'order.status.changed';
  previousStatusId: number;
  newStatusId: number;
  newStatusLabel: string;
};

type OrderCreatedEvent = OrderEventBase & {
  eventType: 'order.created';
  total: number;
};

type OrderNotificationEvent = OrderStatusEvent | OrderCreatedEvent;

function isOrderNotificationEvent(value: unknown): value is OrderNotificationEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<OrderEventBase> & {
    eventType?: string;
    total?: number;
    previousStatusId?: number;
    newStatusId?: number;
    newStatusLabel?: string;
  };
  const validBase =
    typeof event.eventId === 'string' &&
    typeof event.occurredAt === 'string' &&
    !Number.isNaN(Date.parse(event.occurredAt)) &&
    Number.isInteger(event.orderId) &&
    Number.isInteger(event.recipientUserId) &&
    typeof event.recipientEmail === 'string';
  if (!validBase) return false;
  if (event.eventType === 'order.created') {
    return typeof event.total === 'number' && Number.isFinite(event.total) && event.total >= 0;
  }
  if (event.eventType !== undefined && event.eventType !== 'order.status.changed') return false;
  return (
    Number.isInteger(event.previousStatusId) &&
    Number.isInteger(event.newStatusId) &&
    typeof event.newStatusLabel === 'string'
  );
}

export function createOrderNotificationMessageHandler(
  persist: (event: OrderNotificationEvent) => Promise<void>,
  acknowledge: (eventId: string) => Promise<void>,
  reportError: (error: unknown, eventId?: string) => void = console.error
) {
  return async (message: string) => {
    let eventId: string | undefined;
    try {
      const parsed: unknown = JSON.parse(message);
      if (!isOrderNotificationEvent(parsed)) throw new Error('Invalid order notification event payload.');
      eventId = parsed.eventId;
      console.info(
        `[email-service] Received order event eventId=${eventId} ` +
          `type=${parsed.eventType ?? 'order.status.changed'} orderId=${parsed.orderId}.`
      );
      await persist(parsed);
      await acknowledge(parsed.eventId);
      console.info(`[email-service] Acknowledged order event eventId=${parsed.eventId}.`);
    } catch (error) {
      reportError(error, eventId);
    }
  };
}

export async function persistOrderNotificationEvent(event: OrderNotificationEvent): Promise<void> {
  const email = event.recipientEmail.trim().toLowerCase();
  const verified = await isEmailVerified(email);
  const isCreatedEvent = event.eventType === 'order.created';
  const template = isCreatedEvent
    ? orderCreatedEmail(event.orderId, event.total)
    : orderStatusEmail(event.orderId, event.newStatusLabel);
  const [delivery, created] = await EmailDelivery.findOrCreate({
    where: { eventId: event.eventId },
    defaults: {
      eventId: event.eventId,
      recipient: email,
      subject: template.subject,
      text: template.text,
      kind: isCreatedEvent ? 'order-created' : 'order-status',
      status: verified ? 'pending' : 'skipped',
      nextAttemptAt: new Date(),
      eventOccurredAt: new Date(event.occurredAt),
      sentAt: null,
      skipReason: verified ? null : 'Recipient email is not verified.',
    },
  });
  console.info(
    `[email-service] Order event ${created ? 'persisted' : 'already persisted'} ` +
    `eventId=${event.eventId} deliveryId=${delivery.id} ` +
    `type=${event.eventType ?? 'order.status.changed'} status=${delivery.status}.`
  );
}

export async function startOrderStatusConsumer(): Promise<void> {
  const subscriber = createClient({ url: config.redisUrl });
  const acknowledger = createClient({ url: config.redisUrl });
  subscriber.on('error', (error) => console.error('[email-service] Redis subscriber error:', error));
  acknowledger.on('error', (error) => console.error('[email-service] Redis publisher error:', error));
  await Promise.all([subscriber.connect(), acknowledger.connect()]);

  const handler = createOrderNotificationMessageHandler(
    persistOrderNotificationEvent,
    (eventId) => acknowledger.publish(ORDER_STATUS_ACK_CHANNEL, eventId).then(() => undefined),
    (error, eventId) =>
      console.error(
        `[email-service] Could not process order event${eventId ? ` eventId=${eventId}` : ''}:`,
        error
      )
  );
  await Promise.all([
    subscriber.subscribe(ORDER_STATUS_CHANNEL, (message) => {
      void handler(message);
    }),
    subscriber.subscribe(ORDER_CREATED_CHANNEL, (message) => {
      void handler(message);
    }),
  ]);
  console.info(`[email-service] Subscribed to ${ORDER_STATUS_CHANNEL} and ${ORDER_CREATED_CHANNEL}.`);
}
