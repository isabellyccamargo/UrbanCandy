import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class People extends Model {
  declare id_people: number;
  declare name: string;
  declare cpf: string;
  declare telephone: string;
  declare id_user: number;
  declare id_address: number;
}

People.init(
  {
    id_people: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cpf: {
      type: DataTypes.CHAR(11),
      allowNull: false,
      unique: true,
    },
    telephone: {
      type: DataTypes.CHAR(13),
      allowNull: true,
    },
    id_user: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_address: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'People',
    tableName: 'people',
    timestamps: false,
  }
);

export default People;
