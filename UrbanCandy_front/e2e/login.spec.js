import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação (Login)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');

    await page.getByTestId('user-menu-container').hover();

    const loginBtn = page.getByTestId('btn-open-login');
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();
  });

  // SUCESSO
  test('Deve realizar login com sucesso com credenciais válidas', async ({ page }) => {
    await page.getByTestId('input-email').fill('admin@teste.com');
    await page.getByTestId('input-password').fill('Senha123');

    await page.getByTestId('btn-submit-login').click();

    // Validação do estado logado
    await expect(page.getByTestId('logged-user')).toContainText('Administrador');
  });

  // FALHA
  test('Deve exibir mensagem de erro ao tentar logar com credenciais inválidas', async ({
    page,
  }) => {
    await page.getByTestId('input-email').fill('usuario_errado@teste.com');
    await page.getByTestId('input-password').fill('SenhaIncorreta');

    await page.getByTestId('btn-submit-login').click();

    // Captura o elemento de erro que seu modal renderiza
    const errorAlert = page.getByTestId('login-error');

    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).not.toBeEmpty();
  });
});
