import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class Address extends Model {
  declare id_address: number;
  declare cep: string;
  declare city: string;
  declare neighborhood: string;
  declare road: string;
  declare complement: string;
  declare number: bigint;
}

Address.init(
  {
    id_address: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cep: {
      type: DataTypes.CHAR(8),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    neighborhood: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    road: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    complement: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    number: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Address',
    tableName: 'address',
    timestamps: false,
  }
);

export default Address;
