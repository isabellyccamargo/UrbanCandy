import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createOrderNotificationMessageHandler } from '../src/orderStatusConsumer.js';

const event = {
  eventId: 'event-1',
  occurredAt: new Date().toISOString(),
  orderId: 12,
  previousStatusId: 1,
  newStatusId: 2,
  recipientUserId: 7,
  recipientEmail: 'customer@example.com',
  newStatusLabel: 'Preparando',
};

test('persists a status event before acknowledging it', async () => {
  const calls: string[] = [];
  const handle = createOrderNotificationMessageHandler(
    async (received) => {
      assert.deepEqual(received, event);
      calls.push('persisted');
    },
    async (eventId) => {
      assert.equal(eventId, event.eventId);
      calls.push('acknowledged');
    }
  );

  await handle(JSON.stringify(event));
  assert.deepEqual(calls, ['persisted', 'acknowledged']);
});

test('persists an order-created event before acknowledging it', async () => {
  const createdEvent = {
    eventType: 'order.created',
    eventId: 'event-created-1',
    occurredAt: new Date().toISOString(),
    orderId: 13,
    recipientUserId: 7,
    recipientEmail: 'customer@example.com',
    total: 25.5,
  };
  const calls: string[] = [];
  const handle = createOrderNotificationMessageHandler(
    async (received) => {
      assert.deepEqual(received, createdEvent);
      calls.push('persisted');
    },
    async (eventId) => {
      assert.equal(eventId, createdEvent.eventId);
      calls.push('acknowledged');
    }
  );

  await handle(JSON.stringify(createdEvent));
  assert.deepEqual(calls, ['persisted', 'acknowledged']);
});

test('does not acknowledge a status event when persistence fails', async () => {
  let acknowledged = false;
  const errors: unknown[] = [];
  const handle = createOrderNotificationMessageHandler(
    async () => {
      throw new Error('database unavailable');
    },
    async () => {
      acknowledged = true;
    },
    (error) => errors.push(error)
  );

  await handle(JSON.stringify(event));
  assert.equal(acknowledged, false);
  assert.equal(errors.length, 1);
});

test('rejects incomplete status events without acknowledging them', async () => {
  let acknowledged = false;
  const handle = createOrderNotificationMessageHandler(
    async () => {},
    async () => {
      acknowledged = true;
    },
    () => {}
  );

  await handle('{"eventId":"incomplete"}');
  assert.equal(acknowledged, false);
});

test('rejects events with invalid occurrence timestamps without acknowledging them', async () => {
  let persisted = false;
  let acknowledged = false;
  const errors: unknown[] = [];
  const handle = createOrderNotificationMessageHandler(
    async () => {
      persisted = true;
    },
    async () => {
      acknowledged = true;
    },
    (error) => errors.push(error)
  );

  await handle(JSON.stringify({ ...event, occurredAt: 'not-a-date' }));

  assert.equal(persisted, false);
  assert.equal(acknowledged, false);
  assert.equal(errors.length, 1);
});
