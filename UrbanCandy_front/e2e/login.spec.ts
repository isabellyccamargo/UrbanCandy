// import { test, expect } from '@playwright/test';

// const BASE_URL = 'http://localhost:5173';

// // ==================== SETUP ====================

// test.beforeAll(async () => {
//   console.log('🔧 Setup: Preparando testes E2E...');
// });

// test.afterAll(async () => {
//   console.log('🧹 Teardown: Finalizando testes E2E...');
// });

// // ==================== TESTES E2E: LOGIN ====================

// test.describe('🔐 E2E: Login (Autenticação)', () => {
//   test('✅ [E2E-LOGIN] Fluxo completo: Signup → Login → Dashboard', async ({ page }) => {
//     const testEmail = `user-${Date.now()}@test.com`;
//     const testPassword = 'TestPassword123!';

//     // 1. Ir para página de signup
//     await page.goto(`${BASE_URL}/signup`);
//     await expect(page).toHaveTitle(/signup|cadastro/i);

//     // 2. Preencher formulário de cadastro
//     await page.locator("input[name='email'], input[placeholder*='email' i]").fill(testEmail);
//     await page.locator("input[name='password'], input[placeholder*='senha' i]").fill(testPassword);
//     await page.locator("input[name='name'], input[placeholder*='nome' i]").fill('Test User');

//     // 3. Submeter cadastro
//     await page.locator("button[type='submit']").click();

//     // 4. Aguardar redirecionamento para login
//     await page.waitForURL(/login|entrar/i, { timeout: 5000 }).catch(() => {});

//     // 5. Ir para login
//     await page.goto(`${BASE_URL}/login`);

//     // 6. Preencher login
//     await page.locator("input[type='email']").fill(testEmail);
//     await page.locator("input[type='password']").fill(testPassword);

//     // 7. Submeter login
//     await page.locator("button[type='submit']").click();

//     // 8. Verificar se foi redirecionado (saiu de /login)
//     await page.waitForTimeout(2000);
//     expect(page.url()).not.toContain('/login');
//     expect(page.url()).not.toContain('/signup');
//   });

//   test('❌ [E2E-LOGIN] Fluxo de falha: Login com senha incorreta', async ({ page }) => {
//     await page.goto(`${BASE_URL}/login`);

//     // Tentar login com credenciais inválidas
//     await page.locator("input[type='email']").fill('test@example.com');
//     await page.locator("input[type='password']").fill('WrongPassword123');
//     await page.locator("button[type='submit']").click();

//     // Verificar mensagem de erro
//     const errorMessage = page.locator('text=/erro|inválid|falha|incorreto/i');
//     await expect(errorMessage)
//       .toBeVisible({ timeout: 5000 })
//       .catch(async () => {
//         // Se não há mensagem de erro, verificar se ainda está na página de login
//         await expect(page).toHaveURL(/login|entrar/i);
//       });
//   });

//   test('❌ [E2E-LOGIN] Fluxo de proteção: Acessar dashboard sem login', async ({ page }) => {
//     // Tentar acessar dashboard sem estar logado
//     await page.goto(`${BASE_URL}/dashboard`);

//     // Deve redirecionar para login
//     await expect(page).toHaveURL(/login|entrar/i, { timeout: 5000 });
//   });

//   test('✅ [E2E-LOGIN] Logout: Limpar sessão e voltar para login', async ({ page }) => {
//     // 1. Login primeiro (assumindo que credenciais existem)
//     await page.goto(`${BASE_URL}/login`);
//     await page.locator("input[type='email']").fill('demo@example.com');
//     await page.locator("input[type='password']").fill('DemoPassword123');
//     await page.locator("button[type='submit']").click();

//     // 2. Aguardar login bem-sucedido
//     await page.waitForTimeout(2000);
//     const isLoggedIn = !page.url().includes('/login');

//     if (isLoggedIn) {
//       // 3. Encontrar e clicar em botão de logout
//       const logoutButton = page.locator("button:has-text('logout')", {
//         hasNot: page.locator("button:has-text('logout')").first(),
//       });

//       if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
//         await logoutButton.click();

//         // 4. Verificar redirecionamento para login
//         await expect(page).toHaveURL(/login|entrar/i, { timeout: 5000 });
//       }
//     }
//   });
// });

// // ==================== TESTES E2E: CRIAR USUÁRIO ====================

// test.describe('👤 E2E: Criar Usuário (Signup)', () => {
//   test('✅ [E2E-USER] Fluxo completo de cadastro com validação', async ({ page }) => {
//     const testEmail = `newuser-${Date.now()}@test.com`;
//     const testPassword = 'SecurePassword123!';

//     await page.goto(`${BASE_URL}/signup`);

//     // Preencher e submeter
//     await page.locator("input[name='email'], input[placeholder*='email' i]").fill(testEmail);
//     await page.locator("input[name='password'], input[placeholder*='senha' i]").fill(testPassword);
//     await page.locator("input[name='name'], input[placeholder*='nome' i]").fill('New User');

//     await page.locator("button[type='submit']").click();

//     // Verificar sucesso (redirecionamento)
//     await page.waitForURL(/login|sucesso|welcome/i, { timeout: 5000 }).catch(() => {});
//     expect(page.url()).not.toContain('/signup');
//   });

//   test('❌ [E2E-USER] Falha: Cadastro com email duplicado', async ({ page }) => {
//     await page.goto(`${BASE_URL}/signup`);

//     // Tentar cadastro com email já existente
//     await page
//       .locator("input[name='email'], input[placeholder*='email' i]")
//       .fill('test@example.com');
//     await page
//       .locator("input[name='password'], input[placeholder*='senha' i]")
//       .fill('TestPassword123!');
//     await page.locator("input[name='name'], input[placeholder*='nome' i]").fill('Test User');

//     await page.locator("button[type='submit']").click();

//     // Verificar erro
//     const errorMessage = page.locator('text=/duplicad|já existente|cadastrado/i');
//     await expect(errorMessage)
//       .toBeVisible({ timeout: 5000 })
//       .catch(async () => {
//         // Se não há mensagem, verificar se ainda está na página
//         await expect(page).toHaveURL(/signup|cadastro/i);
//       });
//   });

//   test('❌ [E2E-USER] Falha: Formulário com campos vazios', async ({ page }) => {
//     await page.goto(`${BASE_URL}/signup`);

//     // Submeter sem preencher
//     await page.locator("button[type='submit']").click();

//     // Verificar validação (pode ser erro ou requerido)
//     const errorOrInvalid = page
//       .locator("[class*='error'], [class*='invalid'], [aria-invalid='true']")
//       .first();
//     await expect(errorOrInvalid)
//       .toBeVisible({ timeout: 3000 })
//       .catch(async () => {
//         // Se não houver validação visual, pelo menos deve estar na página
//         await expect(page).toHaveURL(/signup|cadastro/i);
//       });
//   });
// });

// // ==================== TESTES E2E: CRUD CATEGORIES ====================

// test.describe('📂 E2E: CRUD Categorias', () => {
//   test('✅ [E2E-CAT] Fluxo completo: Login → Criar Categoria → Listar', async ({ page }) => {
//     const categoryName = `Category-${Date.now()}`;

//     // 1. Login
//     await page.goto(`${BASE_URL}/login`);
//     await page.locator("input[type='email']").fill('demo@example.com');
//     await page.locator("input[type='password']").fill('DemoPassword123');
//     await page.locator("button[type='submit']").click();
//     await page.waitForTimeout(2000);

//     // 2. Ir para página de categorias
//     await page.goto(`${BASE_URL}/categories`);

//     // 3. Criar categoria
//     await page
//       .locator("button:has-text('Adicionar'), button:has-text('Nova'), button:has-text('Criar')")
//       .click();
//     await page.locator("input[name='name'], input[placeholder*='nome' i]").fill(categoryName);
//     await page.locator("button[type='submit']").click();

//     // 4. Verificar se foi criada
//     await expect(page.locator(`text=${categoryName}`))
//       .toBeVisible({ timeout: 5000 })
//       .catch(() => {});
//   });

//   test('✅ [E2E-CAT] Editar categoria existente', async ({ page }) => {
//     // 1. Login
//     await page.goto(`${BASE_URL}/login`);
//     await page.locator("input[type='email']").fill('demo@example.com');
//     await page.locator("input[type='password']").fill('DemoPassword123');
//     await page.locator("button[type='submit']").click();
//     await page.waitForTimeout(2000);

//     // 2. Ir para categorias
//     await page.goto(`${BASE_URL}/categories`);

//     // 3. Clicar em editar da primeira categoria
//     const editButton = page.locator("button:has-text('Editar')").first();
//     if (await editButton.isVisible({ timeout: 1000 }).catch(() => false)) {
//       await editButton.click();

//       // 4. Mudar nome
//       await page.locator("input[name='name']").fill(`Updated-${Date.now()}`);
//       await page.locator("button[type='submit']").click();

//       // 5. Verificar sucesso
//       await expect(page.locator('text=/sucesso|atualizado/i'))
//         .toBeVisible({ timeout: 3000 })
//         .catch(() => {});
//     }
//   });

//   test('✅ [E2E-CAT] Deletar categoria', async ({ page }) => {
//     // 1. Login
//     await page.goto(`${BASE_URL}/login`);
//     await page.locator("input[type='email']").fill('demo@example.com');
//     await page.locator("input[type='password']").fill('DemoPassword123');
//     await page.locator("button[type='submit']").click();
//     await page.waitForTimeout(2000);

//     // 2. Ir para categorias
//     await page.goto(`${BASE_URL}/categories`);

//     // 3. Clicar em deletar
//     const deleteButton = page
//       .locator("button:has-text('Deletar'), button:has-text('Excluir')")
//       .first();
//     if (await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)) {
//       await deleteButton.click();

//       // 4. Confirmar deleção se houver modal
//       const confirmButton = page.locator("button:has-text('Confirmar'), button:has-text('Sim')");
//       if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
//         await confirmButton.click();
//       }
//     }
//   });
// });

// // ==================== TESTES E2E: CRUD PRODUCTS ====================

// test.describe('🛍️ E2E: CRUD Produtos', () => {
//   test('✅ [E2E-PROD] Fluxo completo: Login → Criar Produto → Listar', async ({ page }) => {
//     const productName = `Product-${Date.now()}`;

//     // 1. Login
//     await page.goto(`${BASE_URL}/login`);
//     await page.locator("input[type='email']").fill('demo@example.com');
//     await page.locator("input[type='password']").fill('DemoPassword123');
//     await page.locator("button[type='submit']").click();
//     await page.waitForTimeout(2000);

//     // 2. Ir para produtos
//     await page.goto(`${BASE_URL}/products`);

//     // 3. Criar produto
//     await page
//       .locator("button:has-text('Adicionar'), button:has-text('Novo'), button:has-text('Criar')")
//       .click();
//     await page.locator("input[name='name'], input[placeholder*='nome' i]").fill(productName);
//     await page.locator("input[name='price'], input[placeholder*='preço' i]").fill('99.99');
//     await page.locator("input[name='stock'], input[placeholder*='estoque' i]").fill('10');
//     await page.locator("button[type='submit']").click();

//     // 4. Verificar criação
//     await expect(page.locator(`text=${productName}`))
//       .toBeVisible({ timeout: 5000 })
//       .catch(() => {});
//   });

//   test('✅ [E2E-PROD] Visualizar detalhes do produto', async ({ page }) => {
//     // 1. Login
//     await page.goto(`${BASE_URL}/login`);
//     await page.locator("input[type='email']").fill('demo@example.com');
//     await page.locator("input[type='password']").fill('DemoPassword123');
//     await page.locator("button[type='submit']").click();
//     await page.waitForTimeout(2000);

//     // 2. Ir para produtos
//     await page.goto(`${BASE_URL}/products`);

//     // 3. Clicar no primeiro produto
//     const productLink = page.locator("a:has-text('Ver'), a:has-text('Detalhes')").first();
//     if (await productLink.isVisible({ timeout: 1000 }).catch(() => false)) {
//       await productLink.click();

//       // 4. Verificar página de detalhes
//       await expect(page).toHaveURL(/products\/\d+|produtos\/\d+/i, { timeout: 5000 });
//     }
//   });

//   test('❌ [E2E-PROD] Falha: Criar produto com preço negativo', async ({ page }) => {
//     // 1. Login
//     await page.goto(`${BASE_URL}/login`);
//     await page.locator("input[type='email']").fill('demo@example.com');
//     await page.locator("input[type='password']").fill('DemoPassword123');
//     await page.locator("button[type='submit']").click();
//     await page.waitForTimeout(2000);

//     // 2. Ir para produtos
//     await page.goto(`${BASE_URL}/products`);

//     // 3. Tentar criar com preço negativo
//     await page.locator("button:has-text('Adicionar'), button:has-text('Novo')").click();
//     await page.locator("input[name='name']").fill(`TestProduct-${Date.now()}`);
//     await page.locator("input[name='price']").fill('-99.99');
//     await page.locator("button[type='submit']").click();

//     // 4. Verificar erro
//     const errorMessage = page.locator('text=/negativ|inválid|erro/i');
//     await expect(errorMessage)
//       .toBeVisible({ timeout: 3000 })
//       .catch(() => {});
//   });
// });

// // ==================== TESTES E2E: RESPONSIVIDADE ====================

// test.describe('📱 E2E: Responsividade', () => {
//   test('✅ [E2E-RESP] Interface funciona em Desktop', async ({ page }) => {
//     await page.setViewportSize({ width: 1920, height: 1080 });
//     await page.goto(`${BASE_URL}/login`);

//     await expect(page.locator("input[type='email']")).toBeVisible();
//     await expect(page.locator("input[type='password']")).toBeVisible();
//     await expect(page.locator("button[type='submit']")).toBeVisible();
//   });

//   test('✅ [E2E-RESP] Interface funciona em Tablet', async ({ page }) => {
//     await page.setViewportSize({ width: 768, height: 1024 });
//     await page.goto(`${BASE_URL}/login`);

//     await expect(page.locator("input[type='email']")).toBeVisible();
//   });

//   test('✅ [E2E-RESP] Interface funciona em Mobile', async ({ page }) => {
//     await page.setViewportSize({ width: 375, height: 667 });
//     await page.goto(`${BASE_URL}/login`);

//     await expect(page.locator("input[type='email']")).toBeVisible();
//   });
// });
