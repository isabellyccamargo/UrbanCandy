import { test, expect } from '@playwright/test';

const API_URL = 'http:/api';

// ==================== HEALTH CHECK ====================
// Teste simples para verificar se a API está respondendo

test('✅ [HEALTH] API deve estar saudável e respondendo', async ({ request }) => {
  const response = await request.get(`${API_URL}/health`);
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('status');
  expect(data.status).toBe('ok');
});

test('✅ [HEALTH] API deve ter timestamp válido', async ({ request }) => {
  const response = await request.get(`${API_URL}/health`);
  const data = await response.json();
  expect(data).toHaveProperty('timestamp');
  expect(new Date(data.timestamp)).toBeInstanceOf(Date);
});
