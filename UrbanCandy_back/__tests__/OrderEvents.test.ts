import { describe, expect, it, jest } from '@jest/globals';
import {
  consumeOrderStatusChangedMessage,
  createOrderStatusEventPublisher,
  ORDER_STATUS_CHANGED_CHANNEL,
  type OrderStatusChangedEvent,
} from '../src/events/OrderEvents.js';

describe('Redis Pub/Sub de pedidos', () => {
  it('publica evento de alteração de status com os dados esperados', async () => {
    let publishedChannel = '';
    let publishedMessage = '';
    const publish = createOrderStatusEventPublisher(async (channel, message) => {
      publishedChannel = channel;
      publishedMessage = message;
    });

    await expect(publish(42, 1, 2, 7, 'user@example.com', 'Pronto')).resolves.toBe(true);

    expect(publishedChannel).toBe(ORDER_STATUS_CHANGED_CHANNEL);
    const event = JSON.parse(publishedMessage) as OrderStatusChangedEvent;
    expect(event).toMatchObject({
      orderId: 42,
      previousStatusId: 1,
      newStatusId: 2,
      recipientUserId: 7,
      recipientEmail: 'user@example.com',
      newStatusLabel: 'Pronto',
    });
    expect(event.eventId).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(event.occurredAt))).toBe(false);
  });

  it('registra o evento consumido pelo assinante', () => {
    const consumed: OrderStatusChangedEvent[] = [];
    const event: OrderStatusChangedEvent = {
      eventId: 'event-123',
      occurredAt: new Date().toISOString(),
      orderId: 42,
      previousStatusId: 1,
      newStatusId: 2,
      recipientUserId: 7,
      recipientEmail: 'user@example.com',
      newStatusLabel: 'Pronto',
    };

    consumeOrderStatusChangedMessage(JSON.stringify(event), (message) => consumed.push(message));

    expect(consumed).toEqual([event]);
  });

  it('registra erro para mensagens inválidas sem interromper o assinante', () => {
    const logError = jest.fn<(message: string, error?: unknown) => void>();

    consumeOrderStatusChangedMessage('not-json', undefined, logError);

    expect(logError).toHaveBeenCalledWith(
      `[pubsub] Mensagem inválida em ${ORDER_STATUS_CHANGED_CHANNEL}:`,
      expect.any(SyntaxError)
    );
  });
});
