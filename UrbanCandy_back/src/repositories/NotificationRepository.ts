import { Op } from 'sequelize';
import Notifications from '../models/Notifications.js';

class NotificationRepository {
  async findByUser(id_user: number) {
    const [rows, unreadCount] = await Promise.all([
      Notifications.findAll({
        where: { id_user },
        order: [['created_at', 'DESC']],
        limit: 50,
      }),
      Notifications.count({ where: { id_user, read_at: { [Op.is]: null } } }),
    ]);

    return { rows, unreadCount };
  }

  async createOrderReadyNotification(
    eventId: string,
    id_user: number,
    id_order: number
  ): Promise<Notifications | null> {
    const [notification, created] = await Notifications.findOrCreate({
      where: { event_id: eventId },
      defaults: {
        event_id: eventId,
        id_user,
        id_order,
        title: 'Seu pedido está pronto!',
        message: `O pedido #${id_order} está pronto. Venha aproveitar!`,
      },
    });
    return created ? notification : null;
  }

  async markAsRead(id_notification: number, id_user: number): Promise<boolean> {
    const [affectedRows] = await Notifications.update(
      { read_at: new Date() },
      { where: { id_notification, id_user, read_at: { [Op.is]: null } } }
    );
    return affectedRows > 0;
  }

  async markAllAsRead(id_user: number): Promise<number> {
    const [affectedRows] = await Notifications.update(
      { read_at: new Date() },
      { where: { id_user, read_at: { [Op.is]: null } } }
    );
    return affectedRows;
  }
}

export default new NotificationRepository();
