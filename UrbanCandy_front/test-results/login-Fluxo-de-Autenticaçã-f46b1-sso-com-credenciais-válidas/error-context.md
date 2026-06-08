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

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> C:\Users\BRUNO\AppData\Local\ms-playwright\chromium_headless_shell-1223\chrome-headless-shell-win64\chrome-headless-shell.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=C:\Users\BRUNO\AppData\Local\Temp\playwright_chromiumdev_profile-uGjJ4A --remote-debugging-pipe --no-startup-window
<launched> pid=6848
[pid=6848][err] [0608/110837.591:INFO:CONSOLE:731] "[vite] connecting...", source: http://localhost:5173/@vite/client (731)
[pid=6848][err] [0608/110837.656:INFO:CONSOLE:14341] "%cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold", source: http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=11d77e9d (14341)
[pid=6848][err] [0608/110837.867:INFO:CONSOLE:833] "[vite] connected.", source: http://localhost:5173/@vite/client (833)
[pid=6848][err] [0608/110838.538:INFO:CONSOLE:49] "Tentando login com: [object Object]", source: http://localhost:5173/src/componentes/Login/LoginModal.jsx?t=1780927508311 (49)
[pid=6848][err] [0608/110838.563:INFO:CONSOLE:73] "Erro completo no login: [object Object]", source: http://localhost:5173/src/componentes/Login/LoginModal.jsx?t=1780927508311 (73)
```