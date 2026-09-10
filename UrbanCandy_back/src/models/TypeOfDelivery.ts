import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class TypeOfDelivery extends Model {
  declare id_type_delivery: number;
  declare name: string;
}

TypeOfDelivery.init(
  {
    id_type_delivery: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'TypeOfDelivery',
    tableName: 'type_of_delivery',
    timestamps: false,
  }
);

export default TypeOfDelivery;
