import { DataTypes, Model } from 'sequelize';

import sequelize from '../config/Config.js';

class UserRole extends Model {
    declare id_user_role: number;
    declare id_user: number;
    declare id_role: number;
}

UserRole.init(
    {
        id_user_role: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        id_user: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        id_role: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'UserRole',
        tableName: 'User_role',
        timestamps: false,
    }
);

export default UserRole;