import { randomUUID } from 'node:crypto';
import { createClient } from 'redis';
import { createOrderReadyNotification } from '../service/OrderNotificationService.js';
import { sendNotificationToUser } from '../service/NotificationStream.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const ORDER_STATUS_CHANGED_CHANNEL =
  process.env.ORDER_STATUS_CHANGED_CHANNEL || 'urbancandy:orders:status-changed';
export const ORDER_STATUS_ACK_CHANNEL =
  process.env.ORDER_STATUS_ACK_CHANNEL || 'urbancandy:orders:email-received';

export interface OrderStatusChangedEvent {
  eventId: string;
  occurredAt: string;
  orderId: number;
  previousStatusId: number;
  newStatusId: number;
  recipientUserId: number;
  recipientEmail: string;
  newStatusLabel: string;
}

type MessagePublisher = (channel: string, message: string) => Promise<unknown>;

export function createOrderStatusEventPublisher(publishMessage: MessagePublisher) {
  return async (
    orderId: number,
    previousStatusId: number,
    newStatusId: number,
    recipientUserId: number,
    recipientEmail: string,
    newStatusLabel: string
  ): Promise<boolean> => {
    const event: OrderStatusChangedEvent = {
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId,
      previousStatusId,
      newStatusId,
      recipientUserId,
      recipientEmail,
      newStatusLabel,
    };

    try {
      await publishMessage(ORDER_STATUS_CHANGED_CHANNEL, JSON.stringify(event));
      console.info(
        `[pubsub] Publicado ${ORDER_STATUS_CHANGED_CHANNEL}: ` +
          `eventId=${event.eventId} orderId=${orderId} ` +
          `status=${previousStatusId}->${newStatusId}`
      );
      return true;
    } catch (error) {
      console.error(
        `[pubsub] Falha ao publicar ${ORDER_STATUS_CHANGED_CHANNEL} para pedido ${orderId}:`,
        error
      );
      return false;
    }
  };
}

export function consumeOrderStatusChangedMessage(
  message: string,
  log: (event: OrderStatusChangedEvent) => void = (event) => {
    console.info(
      `[pubsub] Consumido ${ORDER_STATUS_CHANGED_CHANNEL}: ` +
        `eventId=${event.eventId} orderId=${event.orderId} ` +
        `status=${event.previousStatusId}->${event.newStatusId}`
    );
  },
  logError: (message: string, error?: unknown) => void = (message, error) => {
    console.error(message, error);
  }
): OrderStatusChangedEvent | null {
  try {
    const event: unknown = JSON.parse(message);
    if (!isOrderStatusChangedEvent(event)) {
      throw new Error('Payload de alteração de status do pedido inválido.');
    }
    log(event);
    return event;
  } catch (error) {
    logError(`[pubsub] Mensagem inválida em ${ORDER_STATUS_CHANGED_CHANNEL}:`, error);
    return null;
  }
}

function isOrderStatusChangedEvent(value: unknown): value is OrderStatusChangedEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<OrderStatusChangedEvent>;
  return (
    typeof event.eventId === 'string' &&
    typeof event.occurredAt === 'string' &&
    Number.isInteger(event.orderId) &&
    Number.isInteger(event.previousStatusId) &&
    Number.isInteger(event.newStatusId) &&
    Number.isInteger(event.recipientUserId) &&
    typeof event.recipientEmail === 'string' &&
    typeof event.newStatusLabel === 'string'
  );
}

const publisherClient = createClient({ url: redisUrl });
const subscriberClient = publisherClient.duplicate();
let publisherConnection: Promise<unknown> | undefined;
let subscriberConnection: Promise<unknown> | undefined;
let subscriberStarted = false;

publisherClient.on('error', (error: Error) => {
  console.error('[pubsub] Erro no cliente publicador Redis:', error);
});

subscriberClient.on('error', (error: Error) => {
  console.error('[pubsub] Erro no cliente assinante Redis:', error);
});

const publishOrderStatusEvent = createOrderStatusEventPublisher(async (channel, message) => {
  if (!publisherClient.isReady) {
    publisherConnection ??= publisherClient.connect().finally(() => {
      publisherConnection = undefined;
    });
    await publisherConnection;
  }
  return publisherClient.publish(channel, message);
});

export async function publishOrderStatusChanged(
  orderId: number,
  previousStatusId: number,
  newStatusId: number,
  recipientUserId: number,
  recipientEmail: string,
  newStatusLabel: string
): Promise<boolean> {
  if (process.env.NODE_ENV === 'test') return false;
  return publishOrderStatusEvent(
    orderId,
    previousStatusId,
    newStatusId,
    recipientUserId,
    recipientEmail,
    newStatusLabel
  );
}

export async function publishOrderStatusOutboxEvent(
  event: OrderStatusChangedEvent
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;
  if (!publisherClient.isReady) {
    publisherConnection ??= publisherClient.connect().finally(() => {
      publisherConnection = undefined;
    });
    await publisherConnection;
  }
  await publisherClient.publish(ORDER_STATUS_CHANGED_CHANNEL, JSON.stringify(event));
  console.info(
    `[pubsub] Publicado ${ORDER_STATUS_CHANGED_CHANNEL}: ` +
      `eventId=${event.eventId} orderId=${event.orderId} ` +
      `status=${event.previousStatusId}->${event.newStatusId}`
  );
}

export async function initializeOrderEventSubscriber(): Promise<void> {
  if (process.env.NODE_ENV === 'test' || subscriberStarted) return;

  try {
    if (!subscriberClient.isReady) {
      subscriberConnection ??= subscriberClient.connect().finally(() => {
        subscriberConnection = undefined;
      });
      await subscriberConnection;
    }
    await subscriberClient.subscribe(ORDER_STATUS_CHANGED_CHANNEL, (message) => {
      const event = consumeOrderStatusChangedMessage(message);
      if (event) {
        void processOrderStatusChangedEvent(event).catch((error: unknown) => {
          console.error(`[pubsub] Falha ao processar evento ${event.eventId}:`, error);
        });
      }
    });
    subscriberStarted = true;
    console.info(`[pubsub] Assinante conectado ao canal ${ORDER_STATUS_CHANGED_CHANNEL}.`);
  } catch (error) {
    console.error(
      `[pubsub] Não foi possível assinar ${ORDER_STATUS_CHANGED_CHANNEL}; ` +
        'eventos não serão consumidos até a próxima inicialização:',
      error
    );
  }
}

async function processOrderStatusChangedEvent(event: OrderStatusChangedEvent): Promise<void> {
  if (!event.newStatusLabel.toLowerCase().includes('pronto')) {
    return;
  }

  const notification = await createOrderReadyNotification(event);
  if (notification) {
    sendNotificationToUser(event.recipientUserId, notification);
  }
}
