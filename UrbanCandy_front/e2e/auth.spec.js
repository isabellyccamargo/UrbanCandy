import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação (Login)', () => {
  test.beforeEach(async ({ page }) => {
    // Abrir a página principal e garantir que o modal de login seja disparado
    // Como o modal abre via query param no seu setTimeout ou ação, simulamos a URL direta ou ação
    await page.goto('/?login=true');
  });

  test('Deve exibir erro ao tentar entrar com campos vazios', async ({ page }) => {
    // Tenta submeter sem preencher nada (removendo validação nativa do HTML se necessário, ou checando se o form barra)
    await page.locator('button:has-text("Entrar")').click();
    
    // O formulário possui "required", então o navegador barra nativamente. 
    // Vamos preencher espaços em branco para testar a validação do estado do React:
    await page.locator('input[name="email"]').fill('   ');
    await page.locator('input[name="password"]').fill('   ');
    await page.locator('button:has-text("Entrar")').click();

    await expect(page.locator('.error-message-login')).toBeVisible();
  });

  test('Deve alternar a visibilidade da senha ao clicar em Mostrar/Ocultar', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const toggleVisibility = page.locator('.toggle-pass-modal');

    await passwordInput.fill('senha123');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await toggleVisibility.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await toggleVisibility.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Deve exibir mensagem de erro para credenciais inválidas', async ({ page }) => {
    // Intercepta a rota da API para simular falha de login
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ mensagem: 'E-mail ou senha incorretos.' })
      });
    });

    await page.locator('input[name="email"]').fill('errado@email.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('button:has-text("Entrar")').click();

    // Valida se o Toast do React-Toastify ou a div de erro exibe a mensagem correta
    await expect(page.locator('.error-message-login')).toHaveText('E-mail ou senha incorretos.');
  });
});