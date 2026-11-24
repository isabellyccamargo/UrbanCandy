# Entrega contínua e recuperação

## Escopo e estado

O workflow [CI](../../../.github/workflows/ci.yml) executa automaticamente em
pull requests e pushes, ou manualmente. Instala dependências, executa testes,
compila backend, frontend e serviço de e-mail, valida a configuração e constrói
as imagens Docker.

O workflow também possui um job de **deploy temporário para validação**. Depois
do job `validate`, em pushes para `develop` e execuções manuais, ele inicia
backend, frontend, e-mail, bancos e Redis via Docker Compose no runner do
GitHub Actions, aguarda os health checks e consulta a API. Em seguida, encerra
os containers. Isso demonstra o estágio de deploy e valida a inicialização
integrada, mas não publica a aplicação na internet nem a mantém hospedada
depois do workflow. O ambiente local para apresentação continua sendo iniciado
manualmente com Docker Compose.

## Pipeline de CI

1. **Disparo:** pull request, push em qualquer branch ou execução manual pelo GitHub Actions.
2. **Instalação:** `npm ci` com o `package-lock.json`.
3. **Testes:** `npm run test:back`, `npm run test:front` e
   `npm run test:email` executam as suítes dos três serviços.
4. **Build:** `npm run build:check` compila e verifica os tipos de backend,
   frontend e serviço de e-mail.
5. **Imagens Docker:** `docker compose config -q` valida a configuração e
   `docker compose build` constrói backend, e-mail e frontend. A validação usa
   valores fictícios exclusivos do CI, não secrets de produção.

Qualquer falha reprova o job. O job `validate` verifica testes, compilação e
imagens; o job `deploy` inicia o conjunto necessário para a aplicação no
runner temporário e verifica a saúde da API. O ambiente do pipeline usa
credenciais fictícias e não integra provedores externos reais.

## Estratégia de deploy adotada

A estratégia é um **deploy simples via Docker Compose**, sem Blue-Green. No
pipeline, o Compose sobe temporariamente os serviços no runner após os testes
e a construção das imagens; na apresentação, o mesmo Compose é iniciado
manualmente no ambiente local. O deploy temporário do pipeline não substitui
uma hospedagem persistente.

### Publicação manual (Deploy)

1. Com Docker Desktop/Engine ativo e `.env` configurado conforme o
   [guia Docker Compose](../../infraestrutura/docker-compose.md), execute:

   ```powershell
    docker compose up --build -d
   ```

2. Confirme os serviços com `docker compose ps` e valide os fluxos essenciais.

3. **Atenção:** o comando recria serviços e pode causar breve interrupção.
   Faça backup antes.

### Rollback da aplicação

1. Identifique o último commit ou tag saudável.
2. Retorne à versão anterior usando o procedimento de controle de versão do
   projeto.
3. Execute `docker compose up --build -d`.
4. Verifique e registre o rollback.

**Importante:** Rollback da aplicação **não reverte o banco automaticamente**. Só volte a versão se ela for compatível com o schema atual.

## Runbook de incidentes e recuperação

### Aplicação ou deploy indisponível

1. Verifique `docker compose ps` e identifique serviços parados.
2. Consulte os logs com `docker compose logs --tail=200 <serviço>`.
3. Verifique a versão do código, `.env` e portas.
4. Se a falha ocorreu após deploy, siga **Rollback da aplicação**; caso
   contrário, investigue e corrija.
5. Registre início, impacto, causa, ações e recuperação.

### Banco indisponível ou suspeita de corrupção

1. Preserve o volume MySQL. Interrompa gravações se houver risco de corrupção.
2. Verifique o estado e os logs com `docker compose ps urbancandy-db` e
   `docker compose logs --tail=200 urbancandy-db`.
3. Não execute `docker compose down -v` nem remova volumes.
4. Faça backup dos dados atuais e valide a restauração em ambiente isolado.
5. Restaure o backup aprovado no ambiente isolado.
6. Valide a restauração e registre o resultado.

### Backup e Restauração (Visão Geral)

Não há rotina automática de backup. Antes de atualizações, faça backup manual
do banco e dos uploads (`UrbanCandy_back/uploads`). Ensaie a restauração em
ambiente isolado antes de alterar o ambiente ativo.

## Limitações e próximos passos para deploy remoto

- O pipeline automatiza o deploy temporário de validação, mas não publica o
  sistema em uma hospedagem persistente. Para manter a aplicação acessível
  após o workflow, ainda seria necessário escolher um destino de hospedagem,
  que pode ser um serviço gerenciado sem VM própria.
- Backup e restauração são procedimentos manuais; ainda precisam de ensaio
  controlado e evidência registrada.
- Para disponibilizar o sistema continuamente, escolher o destino de
  hospedagem (por exemplo, serviço gerenciado ou servidor próprio), definir
  domínio/TLS quando aplicável, guardar credenciais como secrets e estabelecer
  aprovações e backups. O runner do GitHub Actions é temporário e não hospeda
  a aplicação após o fim do workflow. Validar deploy e rollback no destino
  escolhido antes de declarar o processo pronto para produção.
