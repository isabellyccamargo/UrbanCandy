import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class TypeOfPayment extends Model {
  declare id_payment: number;
  declare name_payment: string;
}

TypeOfPayment.init(
  {
    id_payment: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name_payment: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'TypeOfPayment',
    tableName: 'type_of_payment',
    timestamps: false,
  }
);

export default TypeOfPayment;
