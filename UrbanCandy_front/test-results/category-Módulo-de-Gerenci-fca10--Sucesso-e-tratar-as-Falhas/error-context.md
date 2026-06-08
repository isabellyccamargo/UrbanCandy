# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: category.spec.js >> Módulo de Gerenciamento de Categorias (CRUD) >> Deve executar o fluxo CRUD completo com Sucesso e tratar as Falhas
- Location: e2e\category.spec.js:27:3

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
  - paragraph: "[USER_NOT_FOUND] (Mensagem não definida)"
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
  3  | test.describe('Módulo de Gerenciamento de Categorias (CRUD)', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
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
> 16 |     await expect(page.getByTestId('logged-user')).toBeVisible({ timeout: 10000 });
     |                                                   ^ Error: expect(locator).toBeVisible() failed
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