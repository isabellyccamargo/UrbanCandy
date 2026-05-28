import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('urbancandy', 'root', 'ADMIN', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

export const dataBaseConectionn = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o MySQL (Sequelize) estabelecida!');
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
  }
};

export default sequelize;
