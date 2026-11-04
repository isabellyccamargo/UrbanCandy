import { expect, test } from '@playwright/test';

const product = {
  id_product: 1,
  name: 'Brigadeiro de chocolate',
  price: 8.5,
  image: 'brigadeiro.png',
  description: 'Brigadeiro artesanal',
  featured: 1,
  category: { name_category: 'Brigadeiros' },
};

const category = { id_category: 1, name_category: 'Brigadeiros' };

async function mockCatalog(page) {
  await page.route('**/produto/listar**', (route) =>
    route.fulfill({ json: { data: [product] } })
  );
  await page.route('**/categoria/listar**', (route) =>
    route.fulfill({ json: { data: [category] } })
  );
  await page.route('**/produto/categoria/**', (route) =>
    route.fulfill({ json: { data: [product] } })
  );
}

async function seedAuthenticatedUser(page) {
  await page.addInitScript(() => {
    localStorage.setItem('@UrbanCandy:user', JSON.stringify({ id_user: 1, id_people: 2 }));
    localStorage.setItem('@UrbanCandy:token', 'responsive-test-token');
  });
  await page.route('**/usuario/listarPorId/*', (route) =>
    route.fulfill({
      json: {
        id_user: 1,
        email: 'ana@example.com',
        people: {
          id_people: 2,
          name: 'Ana Candy',
          cpf: '12345678900',
          telephone: '11999999999',
          address: {
            road: 'Rua dos Doces',
            number: '10',
            neighborhood: 'Centro',
            city: 'São Paulo',
          },
        },
      },
    })
  );
  await page.route('**/pagamento/listar**', (route) =>
    route.fulfill({ json: { data: [{ id_payment: 1, name_payment: 'Dinheiro' }] } })
  );
  await page.route('**/entrega/listar', (route) =>
    route.fulfill({
      json: [
        { id_type_delivery: 1, name: 'Entrega' },
        { id_type_delivery: 2, name: 'Retirada' },
      ],
    })
  );
  await page.route('**/email-verification/status', (route) =>
    route.fulfill({ json: { verified: true, userId: 1 } })
  );
  await page.route('**/notificacoes', (route) =>
    route.fulfill({ json: { notifications: [], unreadCount: 0 } })
  );
}

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
}

test.describe('Experiência web responsiva', () => {
  test('mantém a página inicial e o cabeçalho dentro da largura em diferentes resoluções', async ({
    page,
  }) => {
    await mockCatalog(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Doces que/ })).toBeVisible();

    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expectNoHorizontalOverflow(page);
      const header = await page.locator('.main-header').boundingBox();
      expect(header.x).toBeGreaterThanOrEqual(0);
      expect(header.x + header.width).toBeLessThanOrEqual(width + 1);
    }
  });

  test('permite abrir o menu do usuário e o carrinho por toque/teclado em celular', async ({
    page,
  }) => {
    await mockCatalog(page);
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto('/');

    const userMenu = page.getByTestId('user-menu-trigger');
    await userMenu.click();
    await expect(userMenu).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Meus Pedidos' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(userMenu).toHaveAttribute('aria-expanded', 'false');

    await page.getByRole('button', { name: 'Abrir carrinho com 0 itens' }).click();
    const cart = page.getByRole('dialog', { name: '🛒 Carrinho' });
    await expect(cart).toBeVisible();
    const cartBounds = await cart.boundingBox();
    expect(cartBounds.width).toBeLessThanOrEqual(320);
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Fechar carrinho' }).click();

    await page.getByRole('button', { name: 'Entre para ver notificações' }).click();
    await expect(page.getByRole('heading', { name: 'Entrar na Conta' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('navega da categoria ao carrinho em viewport mobile', async ({ page }) => {
    await mockCatalog(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Ver categoria Brigadeiros' }).click();
    await expect(page).toHaveURL(/\/cardapio\/brigadeiros$/);
    await expect(page.getByRole('navigation', { name: 'Categorias do cardápio' })).toBeVisible();
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('button', { name: 'Abrir carrinho com 1 itens' }).click();
    await expect(page.getByRole('dialog', { name: '🛒 Carrinho' })).toContainText(
      'Brigadeiro de chocolate'
    );
    await expectNoHorizontalOverflow(page);
  });

  test('mantém checkout e detalhes do pedido utilizáveis em tela estreita', async ({ page }) => {
    await seedAuthenticatedUser(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        '@UrbanCandy:cart',
        JSON.stringify({
          items: [
            {
              id_product: 1,
              quantity: 2,
              sub_total: 17,
              products: { name: 'Brigadeiro de chocolate', price: 8.5, image: 'brigadeiro.png' },
            },
          ],
          total: 17,
        })
      );
    });
    let orderPayload;
    await page.route('**/pedido/checkout', async (route) => {
      orderPayload = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { id_orders: 10 } });
    });
    await page.route('**/pedido/usuario/*', (route) =>
      route.fulfill({
        json: {
          data: [
            {
              id_orders: 10,
              order_date: '2026-11-03T12:00:00.000Z',
              total: 17,
              paymentType: { name_payment: 'Pix' },
              deliveryType: { name: 'Entrega' },
              status: { label: 'Recebido' },
              items: [
                {
                  id_orderItem: 1,
                  quantity: 2,
                  sub_total: 17,
                  products: { name: 'Brigadeiro de chocolate' },
                },
              ],
            },
          ],
          totalPages: 1,
        },
      })
    );

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/checkout');
    await expect(page.getByRole('heading', { name: 'Resumo do pedido' })).toBeVisible();
    await page.getByRole('radio', { name: 'Entrega' }).check();
    await page.getByRole('radio', { name: 'Dinheiro' }).check();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Finalizar Pedido' }).click();
    await expect(page.getByRole('heading', { name: 'Pedido Confirmado!' })).toBeVisible();
    expect(orderPayload).toMatchObject({
      id_payment: 1,
      id_type_delivery: 1,
      cart: { total: 17, items: [{ id_product: 1, quantity: 2 }] },
    });

    await page.getByRole('button', { name: 'Ver meus pedidos' }).click();
    await expect(page.getByRole('heading', { name: 'Meus Pedidos' })).toBeVisible();
    await page.getByRole('button', { name: 'Ver pedido' }).click();
    const details = page.getByRole('dialog', { name: 'Pedido #10' });
    await expect(details).toBeVisible();
    const detailsBounds = await details.boundingBox();
    expect(detailsBounds.width).toBeLessThanOrEqual(375);
    await expectNoHorizontalOverflow(page);
  });

  test('cria checkout Mercado Pago e mantém o link para concluir o pagamento', async ({ page }) => {
    await seedAuthenticatedUser(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        '@UrbanCandy:cart',
        JSON.stringify({
          items: [
            {
              id_product: 1,
              quantity: 2,
              sub_total: 17,
              products: { name: 'Brigadeiro de chocolate', price: 8.5, image: 'brigadeiro.png' },
            },
          ],
          total: 17,
        })
      );
    });

    let checkoutPayload;
    await page.route('**/pagamento/checkout', async (route) => {
      checkoutPayload = route.request().postDataJSON();
      await route.fulfill({
        json: {
          attemptId: 'attempt-1',
          checkoutUrl: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test',
          total: 17,
        },
      });
    });
    await page.route('**/pagamento/checkout/attempt-1', (route) =>
      route.fulfill({
        json: { id: 'attempt-1', status: 'pending', id_order: null, total: 17 },
      })
    );

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/checkout');
    await page.getByRole('radio', { name: 'Retirada' }).check();
    await page.getByRole('radio', { name: 'Mercado Pago' }).check();
    await page.getByRole('button', { name: 'Pagar com Mercado Pago' }).click();

    await expect(page.getByRole('link', { name: 'Continuar no Mercado Pago' })).toHaveAttribute(
      'href',
      'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test'
    );
    expect(checkoutPayload).toMatchObject({
      id_payment: 0,
      id_type_delivery: 2,
      payment_method: 'both',
      cart: { total: 17, items: [{ id_product: 1, quantity: 2 }] },
    });
    await expectNoHorizontalOverflow(page);
  });
});
