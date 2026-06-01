#!/usr/bin/env node

/**
 * Script de Teardown para Testes E2E
 * Limpa o banco de dados após os testes
 */

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

async function teardown() {
  console.log('\n🧹 Iniciando limpeza pós-testes E2E...');

  try {
    // Limpar banco de dados
    console.log('✓ Limpando banco de dados...');
    try {
      execSync('npx prisma migrate reset --force', {
        cwd: rootDir,
        stdio: 'inherit',
      });
    } catch (error) {
      console.warn('⚠ Falha ao limpar banco, ignorando...');
    }

    console.log('\n✅ Limpeza concluída!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante teardown:', error.message);
    process.exit(1);
  }
}

teardown();
