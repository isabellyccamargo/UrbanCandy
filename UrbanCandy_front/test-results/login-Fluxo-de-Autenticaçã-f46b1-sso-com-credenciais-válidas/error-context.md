# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Fluxo de Autenticação (Login) >> Deve realizar login com sucesso com credenciais válidas
- Location: e2e\login.spec.js:19:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('logged-user')
Expected substring: "Administrador"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
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
  3  | test.describe('Fluxo de Autenticação (Login)', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.addInitScript(() => {
  6  |       localStorage.clear();
  7  |     });
  8  | 
  9  |     await page.goto('/');
  10 | 
  11 |     await page.getByTestId('user-menu-container').hover();
  12 | 
  13 |     const loginBtn = page.getByTestId('btn-open-login');
  14 |     await expect(loginBtn).toBeVisible();
  15 |     await loginBtn.click();
  16 |   });
  17 | 
  18 |   // SUCESSO
  19 |   test('Deve realizar login com sucesso com credenciais válidas', async ({ page }) => {
  20 |     await page.getByTestId('input-email').fill('admin@teste.com');
  21 |     await page.getByTestId('input-password').fill('Senha123');
  22 | 
  23 |     await page.getByTestId('btn-submit-login').click();
  24 | 
  25 |     // Validação do estado logado
> 26 |     await expect(page.getByTestId('logged-user')).toContainText('Administrador');
     |                                                   ^ Error: expect(locator).toContainText(expected) failed
  27 |   });
  28 | 
  29 |   // FALHA
  30 |   test('Deve exibir mensagem de erro ao tentar logar com credenciais inválidas', async ({
  31 |     page,
  32 |   }) => {
  33 |     await page.getByTestId('input-email').fill('usuario_errado@teste.com');
  34 |     await page.getByTestId('input-password').fill('SenhaIncorreta');
  35 | 
  36 |     await page.getByTestId('btn-submit-login').click();
  37 | 
  38 |     // Captura o elemento de erro que seu modal renderiza
  39 |     const errorAlert = page.getByTestId('login-error');
  40 | 
  41 |     await expect(errorAlert).toBeVisible();
  42 |     await expect(errorAlert).not.toBeEmpty();
  43 |   });
  44 | });
  45 | 
```