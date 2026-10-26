import { createClient } from 'redis';
import OrderStatusOutbox from '../models/OrderStatusOutbox.js';
import {
  ORDER_STATUS_ACK_CHANNEL,
  publishOrderStatusOutboxEvent,
} from './OrderEvents.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const publisherClient = createClient({ url: redisUrl });
const acknowledgementClient = publisherClient.duplicate();
let publisherConnection: Promise<unknown> | undefined;
let acknowledgementConnection: Promise<unknown> | undefined;
let dispatching = false;

publisherClient.on('error', (error: Error) => {
  console.error('[outbox] Redis publisher error:', error);
});
acknowledgementClient.on('error', (error: Error) => {
  console.error('[outbox] Redis acknowledgement subscriber error:', error);
});

async function connectPublisher(): Promise<void> {
  if (publisherClient.isReady) return;
  publisherConnection ??= publisherClient.connect().finally(() => {
    publisherConnection = undefined;
  });
  await publisherConnection;
}

async function connectAcknowledgementSubscriber(): Promise<void> {
  if (acknowledgementClient.isReady) return;
  acknowledgementConnection ??= acknowledgementClient.connect().finally(() => {
    acknowledgementConnection = undefined;
  });
  await acknowledgementConnection;
}

export async function dispatchPendingOrderStatusEvents(): Promise<void> {
  if (dispatching || process.env.NODE_ENV === 'test') return;
  dispatching = true;
  try {
    await connectPublisher();
    const pending = await OrderStatusOutbox.findAll({
      where: { acknowledgedAt: null },
      order: [['createdAt', 'ASC']],
      limit: 25,
    });
    for (const record of pending) {
      await publishOrderStatusOutboxEvent(record.payload);
    }
  } catch (error) {
    console.error('[outbox] Failed to publish pending order status events:', error);
  } finally {
    dispatching = false;
  }
}

export async function startOrderStatusOutbox(): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;

  await connectAcknowledgementSubscriber();
  await acknowledgementClient.subscribe(ORDER_STATUS_ACK_CHANNEL, (eventId) => {
    void OrderStatusOutbox.update(
      { acknowledgedAt: new Date() },
      { where: { eventId, acknowledgedAt: null } }
    ).catch((error: unknown) => {
      console.error(`[outbox] Could not acknowledge event ${eventId}:`, error);
    });
  });

  const timer = setInterval(() => {
    void dispatchPendingOrderStatusEvents();
  }, 2000);
  timer.unref();
  await dispatchPendingOrderStatusEvents();
}
