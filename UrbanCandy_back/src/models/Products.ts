import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class Products extends Model {
  declare id_product: number;
  declare name: string;
  declare description: string;
  declare price: number;
  declare image: string;
  declare id_category: bigint;
  declare featured: boolean;
}

Products.init(
  {
    id_product: {
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
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_category: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Products',
    tableName: 'Products',
    timestamps: false,
  }
);

import Categories from './Categories.js';

Products.belongsTo(Categories, { foreignKey: 'id_category', as: 'category' });

export default Products;
