import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Dados do Usuário (MyData)', () => {
  test('Deve preencher o endereço automaticamente ao digitar um CEP válido', async ({ page }) => {
    await page.goto('/perfil/cadastrar');

    // Intercepta a requisição do ViaCEP para evitar flutuações de rede externa
    await page.route('https://viacep.com.br/ws/01001000/json/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          logradouro: 'Praça da Sé',
          bairro: 'Sé',
          localidade: 'São Paulo',
          erro: false,
        }),
      });
    });

    const cepInput = page.locator('input[name="cep"]');
    await cepInput.fill('01001-000');
    await cepInput.blur(); // Dispara o evento onBlur

    // Verifica se os campos foram auto-preenchidos
    await expect(page.locator('input[name="road"]')).toHaveValue('Praça da Sé');
    await expect(page.locator('input[name="neighborhood"]')).toHaveValue('Sé');
    await expect(page.locator('input[name="city"]')).toHaveValue('São Paulo');
  });

  test('Deve validar o formato incorreto de e-mail antes de submeter', async ({ page }) => {
    await page.goto('/perfil/cadastrar');

    await page.locator('input[name="name"]').fill('Candy Tester');
    await page.locator('input[name="cpf"]').fill('123.456.789-00');
    await page.locator('input[name="telephone"]').fill('(11) 99999-9999');
    await page.locator('input[name="email"]').fill('teste@email.org'); // Inválido (.org)

    // Preenche senhas iguais
    await page.locator('input[name="password"]').fill('Senha123');
    await page.locator('input[name="confirmPassword"]').fill('Senha123');

    // Endereço mínimo para passar pelo required
    await page.locator('input[name="cep"]').fill('01001-000');
    await page.locator('input[name="city"]').fill('São Paulo');
    await page.locator('input[name="road"]').fill('Rua Teste');
    await page.locator('input[name="number"]').fill('123');

    // O Playwright escuta o aviso de aviso do Toastify (toast.warning)
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('O e-mail deve conter @ e terminar com .com');
      await dialog.dismiss();
    });

    await page.locator('button:has-text("Finalizar Cadastro")').click();
  });
});
