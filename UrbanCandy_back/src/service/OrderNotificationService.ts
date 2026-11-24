import type { OrderStatusChangedEvent } from '../events/OrderEvents.js';
import NotificationRepository from '../repositories/NotificationRepository.js';

export async function createOrderReadyNotification(event: OrderStatusChangedEvent) {
  return NotificationRepository.createOrderReadyNotification(
    event.eventId,
    event.recipientUserId,
    event.orderId
  );
}

export async function getUserNotifications(userId: number) {
  return NotificationRepository.findByUser(userId);
}

export async function markUserNotificationAsRead(
  notificationId: number,
  userId: number
): Promise<boolean> {
  return NotificationRepository.markAsRead(notificationId, userId);
}

export async function markAllUserNotificationsAsRead(userId: number): Promise<number> {
  return NotificationRepository.markAllAsRead(userId);
}
