import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database.js';

export type EmailDeliveryStatus = 'pending' | 'sending' | 'sent' | 'skipped';
export type EmailDeliveryKind = 'verification' | 'order-status';

export class EmailDelivery extends Model {
  declare id: number;
  declare eventId: string | null;
  declare recipient: string;
  declare subject: string;
  declare text: string;
  declare kind: EmailDeliveryKind;
  declare status: EmailDeliveryStatus;
  declare attempts: number;
  declare nextAttemptAt: Date;
  declare lastError: string | null;
}

EmailDelivery.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    eventId: { type: DataTypes.STRING(80), allowNull: true, unique: true, field: 'event_id' },
    recipient: { type: DataTypes.STRING(254), allowNull: false },
    subject: { type: DataTypes.STRING(255), allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    kind: { type: DataTypes.STRING(30), allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' },
    attempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    nextAttemptAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'next_attempt_at',
    },
    lastError: { type: DataTypes.TEXT, allowNull: true, field: 'last_error' },
  },
  {
    sequelize,
    modelName: 'EmailDelivery',
    tableName: 'email_deliveries',
    timestamps: true,
    underscored: true,
  }
);
