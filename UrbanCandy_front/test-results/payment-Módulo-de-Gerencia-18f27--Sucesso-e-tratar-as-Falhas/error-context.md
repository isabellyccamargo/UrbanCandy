# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment.spec.js >> Módulo de Gerenciamento de Tipos de Pagamento (CRUD) >> Deve executar o fluxo CRUD completo com Sucesso e tratar as Falhas
- Location: e2e\payment.spec.js:27:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('logged-user')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByTestId('logged-user')

```

```yaml
- region "Notifications Alt+T"
- banner:
  - link "SugarBeat Logo":
    - /url: /
    - img "SugarBeat Logo"
  - text: 0 ▼
  - button "×"
  - heading "Entrar na Conta" [level=2]
  - paragraph: E-mail ou senha incorretos.
  - text: E-mail
  - textbox "exemplo@email.com": admin@teste.com
  - text: Senha
  - textbox: Senha123
  - text: Mostrar
  - button "Entrar"
  - paragraph:
    - text: Não tem cadastro?
    - link "Crie sua conta aqui":
      - /url: /perfil/cadastrar
- main:
  - text: ✨ Doçaria Artesanal Premium
  - heading "Doces que Conquistam Corações" [level=1]
  - paragraph: Macios, úmidos e irresistíveis
  - paragraph: Ingredientes nobres, receitas exclusivas e muito amor em cada criação. Descubra o sabor da verdadeira confeitaria artesanal.
  - link "Explorar Cardápio ➔":
    - /url: /cardapio/brigadeiros
  - link "Ver Favoritos":
    - /url: "#destaques"
  - heading "100+" [level=3]
  - paragraph: Clientes Felizes
  - heading "4.9 ★" [level=3]
  - paragraph: Avaliação Média
  - heading "100%" [level=3]
  - paragraph: Artesanal
  - text: Artesanal & Urbano
  - heading "Onde a cidade encontra a sua doçura favorita" [level=2]
  - heading "Destaques da Casa" [level=2]
  - paragraph: Os produtos mais amados pelos nossos clientes
  - img "Cookie De Oreo"
  - heading "Cookie De Oreo" [level=3]
  - paragraph: R$ 15,90
  - button "Adicionar"
  - img "Brownie De Ferrero Rocher"
  - heading "Brownie De Ferrero Rocher" [level=3]
  - paragraph: R$ 19,50
  - button "Adicionar"
  - img "Brownie De Lotus"
  - heading "Brownie De Lotus" [level=3]
  - paragraph: R$ 22,50
  - button "Adicionar"
  - img "Brigadeiro de Amendoim"
  - heading "Brigadeiro de Amendoim" [level=3]
  - paragraph: R$ 4,50
  - button "Adicionar"
  - img "Brigadeiro de Churros"
  - heading "Brigadeiro de Churros" [level=3]
  - paragraph: R$ 5,50
  - button "Adicionar"
  - img "Cookie Lotus"
  - heading "Cookie Lotus" [level=3]
  - paragraph: R$ 15,50
  - button "Adicionar"
  - img "Brownie de Nutella"
  - heading "Brownie de Nutella" [level=3]
  - paragraph: R$ 19,00
  - button "Adicionar"
  - img "Cookie De Oreo"
  - heading "Cookie De Oreo" [level=3]
  - paragraph: R$ 15,90
  - button "Adicionar"
  - img "Brownie De Ferrero Rocher"
  - heading "Brownie De Ferrero Rocher" [level=3]
  - paragraph: R$ 19,50
  - button "Adicionar"
  - img "Brownie De Lotus"
  - heading "Brownie De Lotus" [level=3]
  - paragraph: R$ 22,50
  - button "Adicionar"
  - img "Brigadeiro de Amendoim"
  - heading "Brigadeiro de Amendoim" [level=3]
  - paragraph: R$ 4,50
  - button "Adicionar"
  - img "Brigadeiro de Churros"
  - heading "Brigadeiro de Churros" [level=3]
  - paragraph: R$ 5,50
  - button "Adicionar"
  - img "Cookie Lotus"
  - heading "Cookie Lotus" [level=3]
  - paragraph: R$ 15,50
  - button "Adicionar"
  - img "Brownie de Nutella"
  - heading "Brownie de Nutella" [level=3]
  - paragraph: R$ 19,00
  - button "Adicionar"
  - heading "Nosso Cardápio" [level=2]
  - paragraph: Escolha sua categoria favorita e descubra os sabores. Aqui você escolhe seu doce favorito e fazemos na hora. Fresquinho e delicioso!
  - img "Cookies"
  - text: ❯
  - paragraph: Ver Sabores
  - heading "Cookies" [level=3]
  - img "Brigadeiros"
  - text: ❯
  - paragraph: Ver Sabores
  - heading "Brigadeiros" [level=3]
  - img "Brownies"
  - text: ❯
  - paragraph: Ver Sabores
  - heading "Brownies" [level=3]
  - heading "Por que nos escolher?" [level=2]
  - paragraph: Qualidade, sabor e carinho em cada mordida
  - img "Ingredientes Premium"
  - text: verified
  - heading "Ingredientes Premium" [level=3]
  - paragraph: Utilizamos apenas ingredientes de primeira qualidade selecionados.
  - img "Feito com Amor"
  - text: favorite
  - heading "Feito com Amor" [level=3]
  - paragraph: Cada doce é preparado artesanalmente com carinho e dedicação.
  - img "Entrega Rápida"
  - text: local_shipping
  - heading "Entrega Rápida" [level=3]
  - paragraph: Entregas ágeis e seguras para você receber doces fresquinhos.
  - img "Sabor Inigualável"
  - text: star
  - heading "Sabor Inigualável" [level=3]
  - paragraph: Receitas exclusivas que conquistam o paladar mais exigente.
  - heading "Doces feitos com amor e dedicação" [level=2]
  - paragraph: Na Urban Candy, cada doce é uma obra de arte artesanal. Utilizamos ingredientes premium e receitas exclusivas.
  - link "Ver Cardápio":
    - /url: /cardapio/brigadeiros
  - img "Doce 1"
  - img "Doce 2"
  - img "Doce 3"
- contentinfo:
  - heading "Urban Candy" [level=2]
  - paragraph: Doces artesanais feitos com amor para adoçar os seus momentos especiais.
  - heading "Contato" [level=3]
  - list:
    - listitem: Urban@Urbancandy.com.br
    - listitem: (11) 99999-9999
    - listitem: Rua dos Doces, 123 - Pr
  - heading "Horário" [level=3]
  - list:
    - listitem: "Segunda a Sexta: 9h - 18h"
    - listitem: "Sábado: 9h - 14h"
    - listitem: "Domingo: Fechado"
  - separator
  - paragraph: © 2026 Urban Candy. Todos os direitos reservados.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Módulo de Gerenciamento de Tipos de Pagamento (CRUD)', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  | 
  7  |     const menuUsuario = page.getByTestId('user-menu-trigger');
  8  |     await menuUsuario.click();
  9  | 
  10 |     await page.getByTestId('btn-open-login').click();
  11 | 
  12 |     await page.locator('input[type="email"]').fill('admin@teste.com');
  13 |     await page.locator('input[type="password"]').fill('Senha123');
  14 |     await page.getByTestId('btn-submit-login').click();
  15 | 
> 16 |     await expect(page.getByTestId('logged-user')).toBeVisible({ timeout: 10000 });
     |                                                   ^ Error: expect(locator).toBeVisible() failed
  17 | 
  18 |     await menuUsuario.click();
  19 |     await page.locator('text=Área Administrador').click();
  20 | 
  21 |     await page.waitForURL(/\/admin/, { timeout: 10000 });
  22 | 
  23 |     await page.locator('a[href="/admin/tipos-pagamento"]').click();
  24 |     await expect(page).toHaveURL(/\/admin\/tipos-pagamento/);
  25 |   });
  26 | 
  27 |   test('Deve executar o fluxo CRUD completo com Sucesso e tratar as Falhas', async ({ page }) => {
  28 |     const sufixoUnico = Math.floor(Math.random() * 10000);
  29 |     const novoPagamento = `Pix Empresarial ${sufixoUnico}`;
  30 |     const pagamentoEditado = `Cartão de Crédito ${sufixoUnico}`;
  31 | 
  32 |     // 1. TESTE DE LISTAGEM
  33 |     await expect(
  34 |       page.getByRole('heading', { name: 'Tipos de Pagamento', exact: true })
  35 |     ).toBeVisible();
  36 |     await expect(page.locator('.admin-table')).toBeVisible();
  37 | 
  38 |     // 2. TESTE DE CADASTRO -
  39 |     // NOME EM BRANCO (FALHA)
  40 |     await page.locator('button:has-text("+ Novo Tipo de Pagamento")').click();
  41 |     await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);
  42 | 
  43 |     await page.getByPlaceholder('Pix, Cartão...').fill('   ');
  44 |     await page.locator('button[type="submit"]').click();
  45 |     await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);
  46 | 
  47 |     // CASO DE SUCESSO
  48 |     await page.getByPlaceholder('Pix, Cartão...').fill(novoPagamento);
  49 |     await page.locator('button[type="submit"]').click();
  50 | 
  51 |     await page.waitForURL(/\/admin\/tipos-pagamento/);
  52 |     await expect(page.locator('.admin-table')).toContainText(novoPagamento);
  53 | 
  54 |     // DUPLICIDADE (FALHA)
  55 |     await page.locator('button:has-text("+ Novo Tipo de Pagamento")').click();
  56 |     await page.getByPlaceholder('Pix, Cartão...').fill(novoPagamento);
  57 |     await page.locator('button[type="submit"]').click();
  58 | 
  59 |     await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);
  60 |     await page.locator('button:has-text("Cancelar")').click();
  61 |     await page.waitForURL(/\/admin\/tipos-pagamento/);
  62 | 
  63 |     // 3. TESTE DE EDIÇÃO
  64 |     const linhaTabela = page.locator(`tr:has-text("${novoPagamento}")`);
  65 |     await linhaTabela.locator('.btn-edit').click();
  66 |     await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);
  67 | 
  68 |     // NOME EM BRANCO (FALHA)
  69 |     await page.getByPlaceholder('Pix, Cartão...').fill('   ');
  70 |     await page.locator('button:has-text("Salvar")').click();
  71 |     await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);
  72 | 
  73 |     // DUPLICIDADE (FALHA)
  74 |     await page.getByPlaceholder('Pix, Cartão...').fill('Pix');
  75 |     await page.locator('button:has-text("Salvar")').click();
  76 |     await expect(page).toHaveURL(/\/admin\/tipos-pagamento\/form/);
  77 | 
  78 |     // SUCESSO
  79 |     await page.getByPlaceholder('Pix, Cartão...').fill(pagamentoEditado);
  80 |     await page.locator('button:has-text("Salvar")').click();
  81 | 
  82 |     await page.waitForURL(/\/admin\/tipos-pagamento/);
  83 |     await expect(page.locator('.admin-table')).toContainText(pagamentoEditado);
  84 | 
  85 |     // 4. TESTE DE EXCLUSÃO
  86 |     const linhaAtualizada = page.locator(`tr:has-text("${pagamentoEditado}")`);
  87 |     await linhaAtualizada.locator('.btn-delete').click();
  88 |     await expect(page.locator('.modal-confirmacao h3')).toHaveText('Confirmar Exclusão');
  89 | 
  90 |     await page.locator('.modal-buttons button:has-text("Sim, Excluir")').click();
  91 |     await expect(page.locator('.admin-table')).not.toContainText(pagamentoEditado);
  92 |   });
  93 | });
  94 | 
```