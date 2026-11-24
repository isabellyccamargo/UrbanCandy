import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGmailSender } from '../src/mailer.js';

test('sends email payload through the injected test transport', async () => {
  const sent: unknown[] = [];
  const sender = createGmailSender(async (message) => {
    sent.push(message);
  });

  await sender({
    to: 'customer@example.com',
    subject: 'Order update',
    text: 'Your order is being prepared.',
  });

  assert.deepEqual(sent, [
    {
      to: 'customer@example.com',
      subject: 'Order update',
      text: 'Your order is being prepared.',
    },
  ]);
});
