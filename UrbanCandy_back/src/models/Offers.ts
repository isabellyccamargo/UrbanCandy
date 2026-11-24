import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/Config.js';

class Offers extends Model {
  declare id_offer: number;
  declare name_offer: string;
  declare description: string | null;
  declare discount: number;
  declare price_offer: number;
  declare image: string | null;
  declare active: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

Offers.init(
  {
    id_offer: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name_offer: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    price_offer: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Offers',
    tableName: 'offers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Offers;
