// Script de teardown para testes E2E usando Sequelize
// Limpa todas as tabelas do banco de teste após os testes

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
    await sequelize.drop();
    console.log('Banco de teste limpo após os testes!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao limpar banco de teste:', err);
    process.exit(1);
  }
}

main();
