import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class Notifications extends Model {
  declare id_notification: number;
  declare event_id: string;
  declare id_user: number;
  declare id_order: number;
  declare title: string;
  declare message: string;
  declare read_at: Date | null;
  declare created_at: Date;
}

Notifications.init(
  {
    id_notification: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true,
    },
    id_user: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Notifications',
    tableName: 'notifications',
    timestamps: false,
  }
);

export default Notifications;
