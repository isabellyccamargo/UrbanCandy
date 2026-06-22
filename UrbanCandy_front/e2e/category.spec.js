import { test, expect } from '@playwright/test';

test.describe('Módulo de Gerenciamento de Categorias (CRUD)', () => {
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

    await page.locator('a[href="/admin/categorias"]').click();
    await expect(page).toHaveURL(/\/admin\/categorias/);
  });

  test('Deve executar o fluxo CRUD completo com Sucesso e tratar as Falhas', async ({ page }) => {
    const sufixoUnico = Math.floor(Math.random() * 10000);
    const novaCategoria = `Doces Finos ${sufixoUnico}`;
    const categoriaEditada = `Chocolates Premium ${sufixoUnico}`;

    // 1. TESTE DE LISTAGEM
    await expect(page.getByRole('heading', { name: 'Categorias', exact: true })).toBeVisible();
    await expect(page.locator('.admin-table')).toBeVisible();

    // 2. TESTE DE CADASTRO
    // NOME EM BRANCO (FALHA)
    await page.locator('button:has-text("+ Nova Categoria")').click();
    await expect(page).toHaveURL(/\/admin\/categorias\/form/);

    await page.locator('#categoryName').fill('   ');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/admin\/categorias\/form/);

    // SUCESSO
    await page.locator('#categoryName').fill(novaCategoria);
    await page.locator('button:has-text("Criar Categoria")').click();

    await page.waitForURL(/\/admin\/categorias/);
    await expect(page.locator('.admin-table')).toContainText(novaCategoria);

    // DUPLICIDADE (FALHA)
    await page.locator('button:has-text("+ Nova Categoria")').click();
    await page.locator('#categoryName').fill(novaCategoria);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/admin\/categorias\/form/);

    await page.locator('button:has-text("Cancelar")').click();
    await page.waitForURL(/\/admin\/categorias/);

    // 3. TESTE DE EDIÇÃO
    const linhaTabela = page.locator(`tr:has-text("${novaCategoria}")`);
    await linhaTabela.locator('.btn-edit').click();
    await expect(page).toHaveURL(/\/admin\/categorias\/form/);

    // NOME EM BRANCO (FALHA)
    await page.locator('#categoryName').fill('   ');
    await page.locator('button:has-text("Salvar Alterações")').click();
    await expect(page).toHaveURL(/\/admin\/categorias\/form/);

    // NOME JÁ EXISTENTE (FALHA)
    await page.locator('#categoryName').fill('Brigadeiros');
    await page.locator('button:has-text("Salvar Alterações")').click();
    await expect(page).toHaveURL(/\/admin\/categorias\/form/);

    // SUCESSO
    await page.locator('#categoryName').fill(categoriaEditada);
    await page.locator('button:has-text("Salvar Alterações")').click();

    await page.waitForURL(/\/admin\/categorias/);
    await expect(page.locator('.admin-table')).toContainText(categoriaEditada);

    //4. TESTE DE EXCLUSÃO
    const linhaAtualizada = page.locator(`tr:has-text("${categoriaEditada}")`);
    await linhaAtualizada.locator('.btn-delete').click();
    await expect(page.locator('.modal-confirmacao h3')).toHaveText('Confirmar Exclusão');

    await page.locator('.modal-buttons button:has-text("Sim, Excluir")').click();
    await expect(page.locator('.admin-table')).not.toContainText(categoriaEditada);
  });
});
