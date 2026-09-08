import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class OrderStatus extends Model {
  declare id: number;
  declare name: string;
  declare label: string;
}

OrderStatus.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'OrderStatus',
    tableName: 'order_status',
    timestamps: false,
  }
);

export default OrderStatus;
