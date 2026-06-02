import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'urbancandy', 
  process.env.DB_USER || 'root', 
  process.env.DB_PASSWORD || 'ADMIN', 
  {
    // Se estiver no Docker, ele usa o DB_HOST (urbancandy-db), se for local usa localhost
    host: process.env.DB_HOST || 'localhost', 
    dialect: 'mysql',
    logging: false,
  }
);

export const dataBaseConectionn = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o MySQL (Sequelize) estabelecida!');

    await sequelize.sync({ alter: true }); 
    console.log('Tabelas sincronizadas com sucesso no banco do Docker!');
    
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
  }
};

export default sequelize;
