import { DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

export async function ensureEmailDeliveryAuditSchema(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('email_deliveries');
  const missingColumns = [
    [
      'event_occurred_at',
      { type: DataTypes.DATE, allowNull: true },
    ],
    ['sent_at', { type: DataTypes.DATE, allowNull: true }],
    ['skip_reason', { type: DataTypes.STRING(255), allowNull: true }],
  ] as const;
  const addedColumns: string[] = [];

  for (const [column, definition] of missingColumns) {
    if (column in table) continue;
    await queryInterface.addColumn('email_deliveries', column, definition);
    addedColumns.push(column);
  }

  await sequelize.query(
    `UPDATE email_deliveries
     SET sent_at = updated_at
     WHERE status = 'sent' AND sent_at IS NULL AND updated_at IS NOT NULL`
  );

  if (addedColumns.length > 0) {
    console.info(
      `[email-service] Applied email delivery audit schema migration: ${addedColumns.join(', ')}.`
    );
  }

  const verifiedEmailTable = await queryInterface.describeTable('verified_emails');
  if (verifiedEmailTable.user_id?.allowNull === false) {
    await queryInterface.changeColumn('verified_emails', 'user_id', {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    });
    console.info('[email-service] Updated verified_emails.user_id to support pre-registration.');
  }
}
