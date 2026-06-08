import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class Categories extends Model {
  declare id_category: number;
  declare name_category: string;
}

Categories.init(
  {
    id_category: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name_category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Categories',
    tableName: 'categories',
    timestamps: false,
  }
);

export default Categories;
