import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDeliveryProcessor } from '../src/deliveryWorker.js';

test('records sent status and timestamp after the email sender succeeds', async () => {
  const savedStates: Array<{ status: string; sentAt: Date | null }> = [];
  const delivery = {
    id: 101,
    eventId: 'order-event-101',
    recipient: 'customer@example.com',
    subject: 'Order update',
    text: 'Your order is ready.',
    kind: 'order-status' as const,
    status: 'pending' as const,
    attempts: 0,
    nextAttemptAt: new Date(),
    sentAt: null,
    lastError: null,
    async save() {
      savedStates.push({ status: this.status, sentAt: this.sentAt });
    },
  };
  const process = createDeliveryProcessor(async () => {});

  await process(delivery);

  assert.equal(delivery.status, 'sent');
  assert.equal(delivery.attempts, 1);
  assert.ok(delivery.sentAt instanceof Date);
  assert.equal(delivery.lastError, null);
  assert.equal(savedStates.length, 2);
  assert.equal(savedStates[1].status, 'sent');
  assert.ok(savedStates[1].sentAt instanceof Date);
});

test('does not record a sent timestamp when delivery fails', async () => {
  const delivery = {
    id: 102,
    eventId: 'order-event-102',
    recipient: 'customer@example.com',
    subject: 'Order update',
    text: 'Your order is ready.',
    kind: 'order-status' as const,
    status: 'pending' as const,
    attempts: 0,
    nextAttemptAt: new Date(),
    sentAt: null as Date | null,
    lastError: null as string | null,
    async save() {},
  };
  const process = createDeliveryProcessor(async () => {
    throw new Error('SMTP unavailable');
  });
  const originalError = console.error;
  console.error = () => {};

  try {
    await process(delivery);
  } finally {
    console.error = originalError;
  }

  assert.equal(delivery.status, 'pending');
  assert.equal(delivery.sentAt, null);
  assert.equal(delivery.lastError, 'SMTP unavailable');
});
