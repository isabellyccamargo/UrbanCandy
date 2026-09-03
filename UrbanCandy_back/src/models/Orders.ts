import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class Orders extends Model {
  declare id_orders: number;
  declare id_people: number;
  declare order_date: Date;
  declare total: number;
  declare id_payment: number;
  declare id_type_delivery: number;
  declare status_id: number; // Atualizado para corresponder ao nome do campo no DB
}

Orders.init(
  {
    id_orders: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id_orders',
    },
    id_people: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    id_payment: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'type_of_payment',
        key: 'id_payment',
      },
    },
    id_type_delivery: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'type_of_delivery',
        key: 'id_type_delivery',
      },
    },
    status_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      field: 'status_id', 
      references: {
        model: 'order_status',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Orders',
    tableName: 'orders',
    timestamps: false,
  }
);

export default Orders;