import type { Response } from 'express';
import type Notifications from '../models/Notifications.js';

const clientsByUser = new Map<number, Set<Response>>();

export function subscribeNotificationStream(userId: number, response: Response): () => void {
  const clients = clientsByUser.get(userId) ?? new Set<Response>();
  clients.add(response);
  clientsByUser.set(userId, clients);

  response.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  response.flushHeaders();
  response.write(': conectado\n\n');

  const heartbeat = setInterval(() => {
    response.write(': heartbeat\n\n');
  }, 25_000);

  return () => {
    clearInterval(heartbeat);
    clients.delete(response);
    if (clients.size === 0) clientsByUser.delete(userId);
  };
}

export function sendNotificationToUser(userId: number, notification: Notifications): void {
  const clients = clientsByUser.get(userId);
  if (!clients) return;

  const payload = `data: ${JSON.stringify(notification)}\n\n`;
  for (const response of clients) {
    response.write(payload);
  }
}
