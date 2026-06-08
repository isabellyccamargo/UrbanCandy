// Script de setup para testes E2E usando Sequelize
// Limpa todas as tabelas do banco de teste antes dos testes

const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
if (!databaseUrl || !databaseUrl.includes('test')) {
  console.error('ERRO: O banco de dados de teste não está configurado corretamente!');
  process.exit(1);
}

const sequelize = new Sequelize(databaseUrl, { logging: false });

async function main() {
  try {
    await sequelize.authenticate();
    // Limpa todas as tabelas (DANGER: só use em banco de teste!)
    await sequelize.drop();
    await sequelize.sync();
    console.log('Banco de teste limpo e sincronizado!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao preparar banco de teste:', err);
    process.exit(1);
  }
}

main();
