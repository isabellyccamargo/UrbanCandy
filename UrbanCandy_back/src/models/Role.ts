import { DataTypes, Model } from 'sequelize';

import sequelize from '../config/Config.js';

class Role extends Model {
  declare id_role: number;
  declare name: string;
  declare description: string;
}

Role.init(
  {
    id_role: {
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
    modelName: 'Role',
    tableName: 'Role',
    timestamps: false,
  }
);

export default Role;
