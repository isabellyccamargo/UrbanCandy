import { test, expect } from '@playwright/test';

test.describe('CRUD de Categorias (Painel Admin)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock do carregamento inicial de categorias (Página 1)
    await page.route('**/categoria**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            data: [
              { id_category: 1, name_category: 'Brigadeiros' },
              { id_category: 2, name_category: 'Cookies' },
            ],
            totalPages: 2,
          },
        }),
      });
    });

    await page.goto('/admin/categorias');
  });

  test('Deve listar as categorias corretamente e controlar paginação', async ({ page }) => {
    await expect(page.locator('table.admin-table tbody tr')).toHaveCount(2);
    await expect(page.locator('text=Página 1 de 2')).toBeVisible();

    // Mock para a página 2 ao avançar
    await page.route('**/categoria?page=2**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            data: [{ id_category: 3, name_category: 'Brownies' }],
            totalPages: 2,
          },
        }),
      });
    });

    await page.locator('button:has-text("Próximo")').click();
    await expect(page.locator('text=Página 2 de 2')).toBeVisible();
  });

  test('Deve criar uma nova categoria com sucesso', async ({ page }) => {
    await page.locator('button:has-text("+ Nova Categoria")').click();
    await expect(page).toHaveURL(/\/admin\/categorias\/form/);

    await page.locator('#categoryName').fill('Donuts');

    // Mock do POST de criação
    await page.route('**/categoria/criar', async (route) => {
      await route.fulfill({ status: 201, body: JSON.stringify({ message: 'Criado!' }) });
    });

    await page.locator('button.btn-save').click();
    // Aguarda o redirecionamento pós-sucesso definido no seu setTimeout do front
    await expect(page).toHaveURL(/\/admin\/categorias/);
  });

  test('Deve exibir modal de confirmação antes de excluir uma categoria', async ({ page }) => {
    // Clica no botão "Excluir" do primeiro item da tabela
    await page.locator('button.btn-delete').first().click();

    // Valida se a estrutura de modal que você montou está visível
    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('text=Deseja realmente excluir esta categoria?')).toBeVisible();

    // Mock do Delete na API
    await page.route('**/categoria/excluir/1', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ message: 'Removido!' }) });
    });

    await page.locator('button:has-text("Sim, Excluir")').click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });
});
