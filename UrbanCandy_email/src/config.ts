import dotenv from 'dotenv';
import path from 'node:path';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const configFile = nodeEnv === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), configFile), override: nodeEnv === 'test' });

const expectedDatabase =
  nodeEnv === 'test'
    ? 'urbancandy_email_test'
    : nodeEnv === 'development'
      ? 'urbancandy_email_development'
      : 'urbancandy_email_docker';

if (process.env.EMAIL_DB_NAME && process.env.EMAIL_DB_NAME !== expectedDatabase) {
  throw new Error(
    `Email service database isolation failed: NODE_ENV=${nodeEnv} requires EMAIL_DB_NAME=${expectedDatabase}.`
  );
}

const requiredDatabaseSettings = ['EMAIL_DB_HOST', 'EMAIL_DB_USER', 'EMAIL_DB_PASSWORD'];
if (nodeEnv !== 'test') {
  for (const name of requiredDatabaseSettings) {
    if (!process.env[name]) throw new Error(`Missing required email service setting: ${name}`);
  }
}

const dbPort = Number(process.env.EMAIL_DB_PORT ?? 3306);
if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error('EMAIL_DB_PORT must be an integer between 1 and 65535.');
}

export const config = {
  nodeEnv,
  port: Number(process.env.PORT ?? 3040),
  db: {
    database: process.env.EMAIL_DB_NAME ?? expectedDatabase,
    host: process.env.EMAIL_DB_HOST ?? (nodeEnv === 'test' ? '127.0.0.1' : ''),
    port: dbPort,
    username: process.env.EMAIL_DB_USER ?? (nodeEnv === 'test' ? 'root' : ''),
    password: process.env.EMAIL_DB_PASSWORD ?? (nodeEnv === 'test' ? 'test-only' : ''),
  },
  redisUrl: process.env.EMAIL_REDIS_URL ?? 'redis://127.0.0.1:6380',
  apiKey: process.env.EMAIL_API_KEY ?? (nodeEnv === 'test' ? 'test-only-key' : ''),
  smtp: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    password: process.env.SMTP_APP_PASSWORD ?? '',
    from: process.env.SMTP_FROM ?? '',
  },
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

if (config.nodeEnv !== 'test' && !config.apiKey) {
  throw new Error('EMAIL_API_KEY must be configured outside automated tests.');
}

if (
  config.nodeEnv !== 'test' &&
  (!config.db.host || !config.db.username || !config.db.password)
) {
  throw new Error('Email service database connection settings must be configured.');
}
