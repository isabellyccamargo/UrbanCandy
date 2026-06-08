import { test, expect } from '@playwright/test';

test.describe('Módulo de Gerenciamento de Tipos de Pagamento (CRUD)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    const menuUsuario = page.getByTestId('user-menu-trigger');
    await menuUsuario.click();

    await page.getByTestId('btn-open-login').click();

    await page.locator('input[type="email"]').fill('admin@teste.com');
    await page.locator('input[type="password"]').fill('Senha123');
    await page.getByTestId('btn-submit-login').click();

    await expect(page.getByTestId('logged-user')).toBeVisible({ timeout: 10000 });

    await menuUsuario.click();
    await page.locator('text=Área Administrador').click();

    await page.waitForURL(/\/admin/, { timeout: 10000 });

    await page.locator('a[href="/admin/tipos-pagamento"]').click();
    await expect(page).toHaveURL(/\/admin\/tipos-pagamento/);
  });

  test('Deve executar o fluxo CRUD completo com Sucesso e tratar as Falhas', async ({ page }) => {
    const sufixoUnico = Math.floor(Math.random() * 10000);
    const novoPagamento = `Pix Empresarial ${sufixoUnico}`;
    const pagamentoEditado = `Cartão de Crédito ${sufixoUnico}`;

    // 1. TESTE DE LISTAGEM
    await expect(
      page.getByRole('heading', { name: 'Tipos de Pagamento', exact: true })
    ).toBeVisible();
    await expect(page.locator('.admin-table')).toBeVisible();

    // 2. TESTE DE CADASTRO -
    // NOME EM BRANCO (FALHA)
    await page.locator('button:has-text("+ Novo Tipo de Pagamento")').click();
    await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);

    await page.getByPlaceholder('Pix, Cartão...').fill('   ');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);

    // CASO DE SUCESSO
    await page.getByPlaceholder('Pix, Cartão...').fill(novoPagamento);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/admin\/tipos-pagamento/);
    await expect(page.locator('.admin-table')).toContainText(novoPagamento);

    // DUPLICIDADE (FALHA)
    await page.locator('button:has-text("+ Novo Tipo de Pagamento")').click();
    await page.getByPlaceholder('Pix, Cartão...').fill(novoPagamento);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);
    await page.locator('button:has-text("Cancelar")').click();
    await page.waitForURL(/\/admin\/tipos-pagamento/);

    // 3. TESTE DE EDIÇÃO
    const linhaTabela = page.locator(`tr:has-text("${novoPagamento}")`);
    await linhaTabela.locator('.btn-edit').click();
    await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);

    // NOME EM BRANCO (FALHA)
    await page.getByPlaceholder('Pix, Cartão...').fill('   ');
    await page.locator('button:has-text("Salvar")').click();
    await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);

    // DUPLICIDADE (FALHA)
    await page.getByPlaceholder('Pix, Cartão...').fill('Pix');
    await page.locator('button:has-text("Salvar")').click();
    await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);

    // SUCESSO
    await page.getByPlaceholder('Pix, Cartão...').fill(pagamentoEditado);
    await page.locator('button:has-text("Salvar")').click();

    await page.waitForURL(/\/admin\/tipos-pagamento/);
    await expect(page.locator('.admin-table')).toContainText(pagamentoEditado);

    // 4. TESTE DE EXCLUSÃO
    const linhaAtualizada = page.locator(`tr:has-text("${pagamentoEditado}")`);
    await linhaAtualizada.locator('.btn-delete').click();
    await expect(page.locator('.modal-confirmacao h3')).toHaveText('Confirmar Exclusão');

    await page.locator('.modal-buttons button:has-text("Sim, Excluir")').click();
    await expect(page.locator('.admin-table')).not.toContainText(pagamentoEditado);
  });
});
