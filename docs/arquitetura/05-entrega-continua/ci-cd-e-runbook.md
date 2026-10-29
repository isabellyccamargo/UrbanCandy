# Entrega contínua e recuperação

## Escopo e estado

O workflow [CI](../../../.github/workflows/ci.yml) executa automaticamente em
pull requests e pushes, ou manualmente. Instala dependências, executa testes,
compila backend, frontend e serviço de e-mail, valida a configuração e constrói
as imagens Docker.

O workflow **não publica imagens nem executa deploy remoto**: não há servidor de
produção/homologação nem credenciais configuradas. A promoção para o ambiente
Docker existente é manual.

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

Qualquer falha reprova o job. Esta CI valida o software e as imagens, mas não testa a aplicação integrada com serviços externos reais nem realiza deploy.

## Estratégia de deploy adotada

A estratégia atual é a **recriação manual dos serviços via Docker Compose**, com breve indisponibilidade. Não é Blue-Green.

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

- CI está automatizada; publicação de imagens e deploy remoto não estão
  configurados por falta de servidor/destino aprovado.
- Backup e restauração são procedimentos manuais; ainda precisam de ensaio
  controlado e evidência registrada.
- Antes de automatizar deploy, definir servidor, domínio/TLS, armazenamento de
  secrets, acesso restrito do runner, retenção de backups e responsável pela
  aprovação. Depois, validar deploy e rollback em ambiente protegido antes de
  declarar o processo pronto para produção.
