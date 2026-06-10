# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: category.spec.js >> Módulo de Gerenciamento de Categorias (CRUD) >> Deve executar o fluxo CRUD completo com Sucesso e tratar as Falhas
- Location: e2e\category.spec.js:27:3

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Módulo de Gerenciamento de Categorias (CRUD)', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/');
     |                ^ Error: page.goto: Target page, context or browser has been closed
  6  | 
  7  |     const menuUsuario = page.getByTestId('user-menu-trigger');
  8  |     await menuUsuario.click();
  9  | 
  10 |     await page.getByTestId('btn-open-login').click();
  11 |     await page.locator('input[type="email"]').fill('admin@teste.com');
  12 |     await page.locator('input[type="password"]').fill('Senha123');
  13 | 
  14 |     await page.getByTestId('btn-submit-login').click();
  15 | 
  16 |     await expect(page.getByTestId('logged-user')).toBeVisible({ timeout: 10000 });
  17 | 
  18 |     await menuUsuario.click();
  19 |     await page.locator('text=Área Administrador').click();
  20 | 
  21 |     await page.waitForURL(/\/admin/, { timeout: 10000 });
  22 | 
  23 |     await page.locator('a[href="/admin/categorias"]').click();
  24 |     await expect(page).toHaveURL(/\/admin\/categorias/);
  25 |   });
  26 | 
  27 |   test('Deve executar o fluxo CRUD completo com Sucesso e tratar as Falhas', async ({ page }) => {
  28 |     const sufixoUnico = Math.floor(Math.random() * 10000);
  29 |     const novaCategoria = `Doces Finos ${sufixoUnico}`;
  30 |     const categoriaEditada = `Chocolates Premium ${sufixoUnico}`;
  31 | 
  32 |     // 1. TESTE DE LISTAGEM
  33 |     await expect(page.getByRole('heading', { name: 'Categorias', exact: true })).toBeVisible();
  34 |     await expect(page.locator('.admin-table')).toBeVisible();
  35 | 
  36 |     // 2. TESTE DE CADASTRO
  37 |     // NOME EM BRANCO (FALHA)
  38 |     await page.locator('button:has-text("+ Nova Categoria")').click();
  39 |     await expect(page).toHaveURL(/\/admin\/categorias\/form/);
  40 | 
  41 |     await page.locator('#categoryName').fill('   ');
  42 |     await page.locator('button[type="submit"]').click();
  43 |     await expect(page).toHaveURL(/\/admin\/categorias\/form/);
  44 | 
  45 |     // SUCESSO
  46 |     await page.locator('#categoryName').fill(novaCategoria);
  47 |     await page.locator('button:has-text("Criar Categoria")').click();
  48 | 
  49 |     await page.waitForURL(/\/admin\/categorias/);
  50 |     await expect(page.locator('.admin-table')).toContainText(novaCategoria);
  51 | 
  52 |     // DUPLICIDADE (FALHA)
  53 |     await page.locator('button:has-text("+ Nova Categoria")').click();
  54 |     await page.locator('#categoryName').fill(novaCategoria);
  55 |     await page.locator('button[type="submit"]').click();
  56 | 
  57 |     await expect(page).toHaveURL(/\/admin\/categorias\/form/);
  58 | 
  59 |     await page.locator('button:has-text("Cancelar")').click();
  60 |     await page.waitForURL(/\/admin\/categorias/);
  61 | 
  62 |     // 3. TESTE DE EDIÇÃO
  63 |     const linhaTabela = page.locator(`tr:has-text("${novaCategoria}")`);
  64 |     await linhaTabela.locator('.btn-edit').click();
  65 |     await expect(page).toHaveURL(/\/admin\/categorias\/form/);
  66 | 
  67 |     // NOME EM BRANCO (FALHA)
  68 |     await page.locator('#categoryName').fill('   ');
  69 |     await page.locator('button:has-text("Salvar Alterações")').click();
  70 |     await expect(page).toHaveURL(/\/admin\/categorias\/form/);
  71 | 
  72 |     // NOME JÁ EXISTENTE (FALHA)
  73 |     await page.locator('#categoryName').fill('Brigadeiros');
  74 |     await page.locator('button:has-text("Salvar Alterações")').click();
  75 |     await expect(page).toHaveURL(/\/admin\/categorias\/form/);
  76 | 
  77 |     // SUCESSO
  78 |     await page.locator('#categoryName').fill(categoriaEditada);
  79 |     await page.locator('button:has-text("Salvar Alterações")').click();
  80 | 
  81 |     await page.waitForURL(/\/admin\/categorias/);
  82 |     await expect(page.locator('.admin-table')).toContainText(categoriaEditada);
  83 | 
  84 |     //4. TESTE DE EXCLUSÃO
  85 |     const linhaAtualizada = page.locator(`tr:has-text("${categoriaEditada}")`);
  86 |     await linhaAtualizada.locator('.btn-delete').click();
  87 |     await expect(page.locator('.modal-confirmacao h3')).toHaveText('Confirmar Exclusão');
  88 | 
  89 |     await page.locator('.modal-buttons button:has-text("Sim, Excluir")').click();
  90 |     await expect(page.locator('.admin-table')).not.toContainText(categoriaEditada);
  91 |   });
  92 | });
  93 | 
```