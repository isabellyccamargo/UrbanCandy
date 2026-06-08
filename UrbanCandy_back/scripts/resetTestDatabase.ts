import sequelize from '../src/config/Config.js';

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Este script só pode ser executado com NODE_ENV=test');
}

async function resetDatabase() {
  try {
    console.log('Resetando banco de testes...');
    console.log(`Banco utilizado: ${process.env.DB_NAME}`);

    await sequelize.sync({
      force: true,
    });

    console.log('Banco resetado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao resetar banco:', error);
    process.exit(1);
  }
}

resetDatabase();
