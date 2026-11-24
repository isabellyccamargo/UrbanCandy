import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

const isTestEnvironment = process.env.NODE_ENV === 'test';

dotenv.config({
  path: isTestEnvironment ? '.env.test' : '.env',
  override: isTestEnvironment,
});

if (isTestEnvironment && process.env.DB_NAME !== 'urbancandy_test') {
  throw new Error('Conexão de teste bloqueada: DB_NAME deve ser exatamente urbancandy_test.');
}

const requiredEnvs = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Variável de ambiente obrigatória não encontrada: ${env}`);
  }
});

const dbPort = Number(process.env.DB_PORT || 3306);
if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error('DB_PORT deve ser um número entre 1 e 65535.');
}

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
  }
);

export const dataBaseConectionn = async () => {
  try {
    console.log('=================================');
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`DATABASE: ${process.env.DB_NAME}`);
    console.log(`DB_HOST: ${process.env.DB_HOST}:${dbPort}`);
    console.log('=================================');

    await sequelize.authenticate();
    console.log('Conexão com o MySQL (Sequelize) estabelecida!');

    await sequelize.sync();
    console.log('Tabelas sincronizadas com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
    process.exit(1);
  }
};

export default sequelize;
