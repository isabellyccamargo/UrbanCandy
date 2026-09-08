import { DataTypes, Model } from 'sequelize';

import sequelize from '../config/Config.js';

class Permission extends Model {
  declare id_permission: number;
  declare name: string;
  declare description: string;
}

Permission.init(
  {
    id_permission: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Permission',
    tableName: 'Permission',
    timestamps: false,
  }
);

export default Permission;
