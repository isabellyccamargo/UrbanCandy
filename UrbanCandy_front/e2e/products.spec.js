import { test, expect } from '@playwright/test';
import { Buffer } from 'buffer';

test.describe('CRUD de Produtos (Painel Admin)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock das categorias necessárias para carregar o select do form de produtos
    await page.route('**/categoria**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ id_category: '10', name_category: 'Bolos no Pote' }]
        })
      });
    });
  });

  test('Deve preencher o formulário e enviar um novo produto com upload de imagem', async ({ page }) => {
    await page.goto('/admin/produtos/form');

    // Preenche as informações textuais e numéricas
    await page.locator('label:has-text("Nome do Produto") + input').fill('Bolo de Cenoura com Brigadeiro');
    await page.locator('label:has-text("Descrição Curta") + input').fill('Delicioso bolo artesanal fofinho.');
    await page.locator('input[type="number"]').fill('15.90');
    
    // Interagindo com o elemento Select customizado
    await page.locator('select.custom-select').selectOption('10');

    // Clica e valida a caixa de alternância de produto em destaque (featured)
    const featuredToggle = page.locator('.featured-toggle-box');
    await featuredToggle.click();
    await expect(page.locator('.custom-check')).toHaveClass(/active/);

    // Mock do Upload de Arquivo / Imagem utilizando o Playwright
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.image-dropzone').click();
    const fileChooser = await fileChooserPromise;
    
    // Envia um buffer simulando uma imagem fake (.png) de teste
    await fileChooser.setFiles({
      name: 'test-candy.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data'),
    });

    // Garante que o preview da imagem foi renderizado no front-end
    await expect(page.locator('img.img-preview-full')).toBeVisible();

    // Mock da rota de criação de produto do backend (Multipart/Form-Data)
    await page.route('**/produtos/criar**', async route => {
      await route.fulfill({ status: 201, body: JSON.stringify({ message: 'Produto salvo!' }) });
    });

    // Envia o formulário
    await page.locator('button:has-text("Salvar Produto")').click();
    await expect(page).toHaveURL(/\/admin\/produtos/);
  });
});