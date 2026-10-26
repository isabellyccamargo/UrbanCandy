import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database.js';

export class VerifiedEmail extends Model {
  declare email: string;
  declare userId: number;
  declare codeHash: string;
  declare expiresAt: Date;
  declare verifiedAt: Date | null;
  declare lastRequestedAt: Date;
  declare failedAttempts: number;
}

VerifiedEmail.init(
  {
    email: { type: DataTypes.STRING(254), primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
    codeHash: { type: DataTypes.STRING(64), allowNull: false, field: 'code_hash' },
    expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
    verifiedAt: { type: DataTypes.DATE, allowNull: true, field: 'verified_at' },
    lastRequestedAt: { type: DataTypes.DATE, allowNull: false, field: 'last_requested_at' },
    failedAttempts: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'failed_attempts',
    },
  },
  {
    sequelize,
    modelName: 'VerifiedEmail',
    tableName: 'verified_emails',
    timestamps: true,
    underscored: true,
  }
);
