import type { NextFunction, Request, Response } from 'express';
import {
  getUserNotifications,
  markAllUserNotificationsAsRead,
  markUserNotificationAsRead,
} from '../service/OrderNotificationService.js';
import { subscribeNotificationStream } from '../service/NotificationStream.js';
import { ApiException } from '../exception/ApiException.js';

class NotificationController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new ApiException('USER_NOT_FOUND', 401);
      const result = await getUserNotifications(userId);
      res.status(200).json({
        notifications: result.rows,
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  static stream(req: Request, res: Response): void {
    const userId = req.userId;
    if (!userId) {
      res.status(401).end();
      return;
    }

    const unsubscribe = subscribeNotificationStream(userId, res);
    res.on('close', unsubscribe);
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificationId = Number(req.params.id_notification);
      if (!Number.isInteger(notificationId) || notificationId <= 0) {
        throw new ApiException('INVALID_ID', 400, 'id_notification');
      }
      const userId = req.userId;
      if (!userId) throw new ApiException('USER_NOT_FOUND', 401);

      const updated = await markUserNotificationAsRead(notificationId, userId);
      if (!updated) throw new ApiException('NOTIFICATION_NOT_FOUND', 404, notificationId);
      res.status(200).json({ message: 'Notificação marcada como lida.' });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new ApiException('USER_NOT_FOUND', 401);
      const updatedCount = await markAllUserNotificationsAsRead(userId);
      res.status(200).json({ updatedCount });
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
