import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createOrderStatusMessageHandler } from '../src/orderStatusConsumer.js';

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
  const handle = createOrderStatusMessageHandler(
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

test('does not acknowledge a status event when persistence fails', async () => {
  let acknowledged = false;
  const errors: unknown[] = [];
  const handle = createOrderStatusMessageHandler(
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
  const handle = createOrderStatusMessageHandler(
    async () => {},
    async () => {
      acknowledged = true;
    },
    () => {}
  );

  await handle('{"eventId":"incomplete"}');
  assert.equal(acknowledged, false);
});
