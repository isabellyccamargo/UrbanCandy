import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class OrderItem extends Model {
  declare id_orderItem: number;
  declare id_pedido: number;
  declare id_produto: number;
  declare quantity: number;
  declare unit_price: number;
  declare sub_total: number;
}

OrderItem.init(
  {
    id_orderItem: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_product: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sub_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_item',
    timestamps: false,
  }
);

export default OrderItem;
