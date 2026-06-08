import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Carrega o arquivo de ambiente correto
dotenv.config({
  path: process.env.NODE_ENV === 'test'
    ? '.env.test'
    : '.env',
});

const requiredEnvs = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
];

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Variável de ambiente obrigatória não encontrada: ${env}`);
  }
});

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    // Se estiver no Docker, ele usa o DB_HOST (urbancandy-db), se for local usa localhost
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

export const dataBaseConectionn = async () => {
  try {
    console.log('=================================');
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`DATABASE: ${process.env.DB_NAME}`);
    console.log('=================================');

    await sequelize.authenticate();
    console.log('Conexão com o MySQL (Sequelize) estabelecida!');

    await sequelize.sync({ alter: true });
    console.log('Tabelas sincronizadas com sucesso no banco do Docker!');
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
    process.exit(1);
  }
};

export default sequelize;
