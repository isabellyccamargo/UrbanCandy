import dotenv from 'dotenv';
import mysql, { type Connection, type RowDataPacket } from 'mysql2/promise';

dotenv.config({ path: '.env' });
dotenv.config({ path: '../.env', override: false });

const sourceConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ADMIN',
  database: process.env.DB_NAME || 'urbancandy',
};

const targetConfig = {
  host: '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3307),
  user: 'root',
  password: process.env.DB_PASSWORD || 'ADMIN',
  database: 'urbancandy_docker',
};

const tables = [
  'address',
  'users',
  'people',
  'role',
  'permission',
  'user_role',
  'role_permission',
  'categories',
  'products',
  'type_of_delivery',
  'type_of_payment',
  'offers',
  'offer_products',
  'order_status',
];

const operationalTables = [
  'notifications',
  'order_status_outbox',
  'order_item',
  'payment_attempts',
  'orders',
];

function quoteIdentifier(identifier: string) {
  return `\`${identifier.replaceAll('`', '``')}\``;
}

async function getTableColumns(connection: Connection, table: string) {
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
     ORDER BY ORDINAL_POSITION`,
    [table],
  );
  return new Set(rows.map((row) => String(row.COLUMN_NAME)));
}

async function getTableNames(connection: Connection) {
  const [rows] = await connection.query<RowDataPacket[]>('SHOW TABLES');
  const key = rows.length > 0 ? Object.keys(rows[0])[0] : '';
  return new Map(
    rows.map((row) => [String(row[key]).toLowerCase(), String(row[key])]),
  );
}

async function migrate() {
  if (sourceConfig.database !== 'urbancandy') {
    throw new Error(`Banco local inesperado: ${sourceConfig.database}.`);
  }
  if (targetConfig.database !== 'urbancandy_docker') {
    throw new Error(`Banco Docker inesperado: ${targetConfig.database}.`);
  }

  const source = await mysql.createConnection(sourceConfig);
  const target = await mysql.createConnection(targetConfig);

  try {
    await source.ping();
    await target.ping();
    const targetTableNames = await getTableNames(target);
    await target.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const sourceTable of [...tables].reverse()) {
      const targetTable = targetTableNames.get(sourceTable.toLowerCase());
      if (targetTable) {
        await target.query(`TRUNCATE TABLE ${quoteIdentifier(targetTable)}`);
      }
    }

    for (const sourceTable of [...operationalTables].reverse()) {
      const targetTable = targetTableNames.get(sourceTable.toLowerCase());
      if (targetTable) {
        await target.query(`TRUNCATE TABLE ${quoteIdentifier(targetTable)}`);
      }
    }

    for (const sourceTable of tables) {
      const [rows] = await source.query<RowDataPacket[]>(
        `SELECT * FROM ${quoteIdentifier(sourceTable)}`,
      );
      const targetTable = targetTableNames.get(sourceTable.toLowerCase());
      if (!targetTable) {
        console.log(`${sourceTable}: tabela ausente no destino`);
        continue;
      }
      if (rows.length === 0) {
        console.log(`${sourceTable}: 0 registros`);
        continue;
      }

      const sourceColumns = await getTableColumns(source, sourceTable);
      const targetColumns = await getTableColumns(target, targetTable);
      const columns = Object.keys(rows[0]).filter(
        (column) => sourceColumns.has(column) && targetColumns.has(column),
      );

      if (columns.length === 0) {
        throw new Error(`Nenhuma coluna compatível encontrada em ${sourceTable}.`);
      }

      const duplicateKeys: Record<string, (row: RowDataPacket) => string> = {
        user_role: (row) => `${String(row.id_user)}:${String(row.id_role)}`,
        role_permission: (row) =>
          `${String(row.id_role)}:${String(row.id_permission)}`,
      };
      const seen = new Set<string>();

      for (const row of rows) {
        if (duplicateKeys[sourceTable]) {
          const duplicateKey = duplicateKeys[sourceTable](row);
          if (seen.has(duplicateKey)) {
            continue;
          }
          seen.add(duplicateKey);
        }

        const values = columns.map((column) => {
          const value = row[column];
          if (
            typeof value === 'object'
            && value !== null
            && ['payload', 'cart_snapshot'].includes(column)
          ) {
            return JSON.stringify(value);
          }
          return value;
        });
        const placeholders = columns.map(() => '?').join(', ');
        await target.query(
          `INSERT INTO ${quoteIdentifier(targetTable)} (${columns.map(quoteIdentifier).join(', ')})
           VALUES (${placeholders})`,
          values,
        );
      }

      console.log(`${sourceTable}: ${rows.length} registro(s)`);
    }

    const userRoleTable = targetTableNames.get('user_role');
    const roleTable = targetTableNames.get('role');
    if (userRoleTable && roleTable) {
      const [customerRows] = await target.query<RowDataPacket[]>(
        `SELECT id_role FROM ${quoteIdentifier(roleTable)}
         WHERE LOWER(name) = 'cliente'
         LIMIT 1`,
      );
      const customerRoleId =
        customerRows.length > 0
          ? Number(customerRows[0].id_role)
          : 1;

      const [usersWithoutRole] = await target.query<RowDataPacket[]>(
        `SELECT u.id_user
         FROM users u
         LEFT JOIN ${quoteIdentifier(userRoleTable)} ur ON ur.id_user = u.id_user
         WHERE ur.id_user IS NULL`,
      );

      for (const row of usersWithoutRole) {
        await target.query(
          `INSERT INTO ${quoteIdentifier(userRoleTable)} (id_user, id_role)
           VALUES (?, ?)`,
          [Number(row.id_user), customerRoleId],
        );
      }

      if (usersWithoutRole.length > 0) {
        console.log(
          `user_role: ${usersWithoutRole.length} usuário(s) sem cargo associado ao Cliente`,
        );
      }
    }

    await target.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    await target.query('SET FOREIGN_KEY_CHECKS = 1');
    throw error;
  } finally {
    await source.end();
    await target.end();
  }
}

migrate().catch((error) => {
  console.error('Erro ao migrar os dados:', error);
  process.exitCode = 1;
});
