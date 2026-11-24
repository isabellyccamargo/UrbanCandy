import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';
import type Role from './Role.js';

class Users extends Model {
  declare id_user: number;
  declare email: string;
  declare password: string;
  declare roles?: Role[];
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
  },
  {
    sequelize,
    modelName: 'Users',
    tableName: 'users',
    timestamps: false,
  }
);

export default Users;
