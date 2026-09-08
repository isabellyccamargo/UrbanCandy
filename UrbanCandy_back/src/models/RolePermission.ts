import { DataTypes, Model } from 'sequelize';

import sequelize from '../config/Config.js';

class RolePermission extends Model {
  declare id_role_permission: number;
  declare id_role: number;
  declare id_permission: number;
}

RolePermission.init(
  {
    id_role_permission: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_role: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_permission: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'Role_permission',
    timestamps: false,
  }
);

export default RolePermission;
