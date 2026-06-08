import { test, expect } from '@playwright/test';

test.describe('Fluxo de Cadastro de Usuário', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/');

    await page.getByTestId('user-menu-container').hover();
    await page.getByTestId('btn-open-login').click();

    await page.locator('text=Crie sua conta aqui').click();

    await expect(page).toHaveURL(/\/perfil\/cadastrar/);
    await expect(page.locator('h1')).toHaveText('Criar Conta');
  });

  // SUCESSO 
  test('Deve cadastrar um novo usuário com sucesso', async ({ page }) => {
    const uuid = Math.floor(Math.random() * 9000) + 1000;
    const emailUnico = `user_${uuid}@teste.com`;
    const cpfUnico = String(Math.floor(Math.random() * 90000000000) + 10000000000);
    
    await page.locator('input[name="name"]').fill('Felipe Teste E2E');
    await page.locator('input[name="cpf"]').fill(cpfUnico);
    await page.locator('input[name="telephone"]').fill('11999999999');
    await page.locator('input[name="email"]').fill(emailUnico);
    await page.locator('input[name="password"]').fill('Senha123');
    await page.locator('input[name="confirmPassword"]').fill('Senha123');

    // --- Endereço e Gatilho da API ViaCEP ---
    const viaCepPromise = page.waitForResponse(response => 
      response.url().includes('viacep.com.br') && response.status() === 200
    );

    await page.locator('input[name="cep"]').fill('01001000'); 
    await page.locator('input[name="cep"]').blur(); 
    await viaCepPromise;

    await page.locator('input[name="number"]').fill('123');

    await page.locator('button:has-text("Finalizar Cadastro")').click();

    await page.waitForURL(/\/.*?login=true/, { timeout: 5000 });
    
    // Garante que o Modal de Login está visível novamente na tela para o usuário logar
    await expect(page.locator('text=Entrar na Conta')).toBeVisible();
  });

  // FALHA
  test('Deve impedir o cadastro e validar as regras de campos incorretos (CPF, Senha e E-mail)', async ({ page }) => {
    // ---- 1. TESTANDO SENHAS DIFERENTES ----
    await page.locator('input[name="name"]').fill('Usuário Teste Falha');
    await page.locator('input[name="cpf"]').fill('12345678901');
    await page.locator('input[name="telephone"]').fill('11988888888');
    await page.locator('input[name="email"]').fill('teste@email.com');
    
    await page.locator('input[name="password"]').fill('Senha123');
    await page.locator('input[name="confirmPassword"]').fill('SenhaDiferente');
    
    await page.locator('input[name="cep"]').fill('01001000');
    await page.locator('input[name="number"]').fill('99');

    await page.locator('button:has-text("Finalizar Cadastro")').click();

    // Valida que o sistema barrou
    await expect(page).toHaveURL(/\/perfil\/cadastrar/);

    // ---- 2. TESTANDO E-MAIL SEM O PADRÃO REQUIRED DO HTML ----
    await page.locator('input[name="confirmPassword"]').fill('Senha123');
    await page.locator('input[name="email"]').fill('email_errado_sem_nada');

    await page.locator('button:has-text("Finalizar Cadastro")').click();
    await expect(page).toHaveURL(/\/perfil\/cadastrar/); 

    // ---- 3. TESTANDO CPF CURTO ----
    await page.locator('input[name="email"]').fill('teste_valido@email.com');
    await page.locator('input[name="cpf"]').fill('123');

    await page.locator('button:has-text("Finalizar Cadastro")').click();
    
    // VALIDAÇÃO FINAL: Garante que após todas as tentativas erradas, o sistema não avançou
    await expect(page).toHaveURL(/\/perfil\/cadastrar/);
    await expect(page.locator('button:has-text("Finalizar Cadastro")')).toBeVisible();
  });
});