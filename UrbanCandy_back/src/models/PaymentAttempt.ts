import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

export type PaymentAttemptStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'failed';

export interface PaymentCartItem {
  id_product: number;
  quantity: number;
  unit_price: number;
  sub_total: number;
  name: string;
}

class PaymentAttempt extends Model {
  declare id: string;
  declare user_id: number;
  declare id_people: number;
  declare id_payment: number;
  declare id_type_delivery: number;
  declare cart_snapshot: PaymentCartItem[];
  declare total: string;
  declare status: PaymentAttemptStatus;
  declare preference_id: string | null;
  declare provider_payment_id: string | null;
  declare id_order: number | null;
}

PaymentAttempt.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_people: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_payment: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_type_delivery: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    cart_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
    },
    preference_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    provider_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    id_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'PaymentAttempt',
    tableName: 'payment_attempts',
    timestamps: true,
    underscored: true,
  }
);

export default PaymentAttempt;
