#!/usr/bin/env node

/**
 * Script de Setup para Testes E2E
 * Limpa e prepara o banco de dados de teste
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');

async function setup() {
  console.log('\n🔄 Iniciando setup para testes E2E...');

  try {
    // 1. Verificar variáveis de ambiente
    console.log('✓ Verificando variáveis de ambiente...');
    if (!process.env.DB_HOST) {
      throw new Error('DB_HOST não configurado');
    }

    // 2. Resetar banco de dados (Prisma)
    console.log('✓ Resetando banco de dados com Prisma...');
    try {
      execSync('npx prisma migrate reset --force', {
        cwd: rootDir,
        stdio: 'inherit',
      });
    } catch (error) {
      console.warn('⚠ Prisma reset falhou, tentando sync...');
      execSync('npx prisma db push --skip-generate', {
        cwd: rootDir,
        stdio: 'inherit',
      });
    }

    // 3. Semear dados de teste (se existir arquivo de seed)
    const seedFile = path.join(rootDir, 'prisma', 'seed.ts');
    if (fs.existsSync(seedFile)) {
      console.log('✓ Seedando dados de teste...');
      execSync('npx ts-node prisma/seed.ts', {
        cwd: rootDir,
        stdio: 'inherit',
      });
    }

    console.log('\n✅ Setup concluído com sucesso!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante setup:', error.message);
    process.exit(1);
  }
}

setup();
