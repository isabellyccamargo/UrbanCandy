import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class OfferProducts extends Model {
  declare id_offer_product: number;
  declare id_offer: number;
  declare id_product: number;
  declare quantity: number;
}

OfferProducts.init(
  {
    id_offer_product: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    id_offer: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    id_product: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: 'OfferProducts',
    tableName: 'offer_products',
    timestamps: false,
  }
);

export default OfferProducts;
