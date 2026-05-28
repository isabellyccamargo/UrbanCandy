import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class Users extends Model {
  declare id_user: number;
  declare email: string;
  declare password: string;
  declare administrator: string;
}

Users.init(
  {
    id_user: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    administrator: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: true,
      defaultValue: '0',
    },
  },
  {
    sequelize,
    modelName: 'Users',
    tableName: 'users',
    timestamps: false,
  }
);

export default Users;
