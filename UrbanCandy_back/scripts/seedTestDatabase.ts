// scripts/seedTestDatabase.ts
import { initializeDatabase } from '../src/config/bootstrap.js';
import UserService from '../src/service/UserService.js';
import Categories from '../src/models/Categories.js';
import TypeOfPayment from '../src/models/TypeOfPayment.js';

initializeDatabase();

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Este script só pode ser executado com NODE_ENV=test');
}

async function seedDatabase() {
  try {
    console.log('Criando dados de teste...');

    await UserService.createUser({
      email: 'admin@teste.com',
      password: 'Senha123',
      name: 'Administrador Teste',
      cpf: '12345678901',
      telephone: '44999999999',
      cep: '87200000',
      city: 'Araruna',
      neighborhood: 'Centro',
      road: 'Rua Teste',
      number: 123,
      complement: '',
      administrator: '1',
    });

    await Categories.create({
      name_category: 'Chocolate',
    });

    await TypeOfPayment.create({
      name_payment: 'Pix',
    });

    console.log('Seed executado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  }
}

seedDatabase();
