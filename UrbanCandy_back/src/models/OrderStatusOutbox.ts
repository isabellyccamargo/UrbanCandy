import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

export interface OrderStatusOutboxEvent {
  eventType?: 'order.status.changed';
  eventId: string;
  occurredAt: string;
  orderId: number;
  previousStatusId: number;
  newStatusId: number;
  recipientUserId: number;
  recipientEmail: string;
  newStatusLabel: string;
}

export interface OrderCreatedOutboxEvent {
  eventType: 'order.created';
  eventId: string;
  occurredAt: string;
  orderId: number;
  recipientUserId: number;
  recipientEmail: string;
  total: number;
}

export type OrderOutboxEvent = OrderStatusOutboxEvent | OrderCreatedOutboxEvent;

class OrderStatusOutbox extends Model {
  declare eventId: string;
  declare payload: OrderOutboxEvent;
  declare acknowledgedAt: Date | null;
}

OrderStatusOutbox.init(
  {
    eventId: { type: DataTypes.UUID, primaryKey: true, field: 'event_id' },
    payload: { type: DataTypes.JSON, allowNull: false },
    acknowledgedAt: { type: DataTypes.DATE, allowNull: true, field: 'acknowledged_at' },
  },
  {
    sequelize,
    modelName: 'OrderStatusOutbox',
    tableName: 'order_status_outbox',
    timestamps: true,
    underscored: true,
  }
);

export default OrderStatusOutbox;
