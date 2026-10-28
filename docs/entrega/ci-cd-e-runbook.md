# Entrega contínua e recuperação

## Escopo e estado
O workflow [.github/workflows/ci.yml](../../.github/workflows/ci.yml) executa CI automaticamente em pull requests e pushes, ou manualmente. Ele instala dependências, executa testes, compila backend, frontend e serviço de e-mail, valida e constrói as imagens Docker. O workflow **não publica imagens nem executa deploy remoto**, pois não há servidor de produção/homologação nem credenciais configuradas. A promoção de uma versão para o ambiente Docker existente é manual.

## Pipeline de CI

1.  **Disparo:** pull request, push em qualquer branch ou execução manual pelo GitHub Actions.
2. **Instalação:** `npm ci` com o `package-lock.json`.
3. **Testes:** `npm run test:back`, `npm run test:front` e
   `npm run test:email` executam as suítes dos três serviços.
4. **Build:** `npm run build:check` compila e verifica os tipos de backend,
   frontend e serviço de e-mail.
5.  **Infraestrutura:** docker compose config -q verifica a configuração e docker compose build constrói as imagens de backend, e-mail e frontend. As variáveis usadas nesta validação são valores fictícios exclusivos do CI, não secrets de produção.

Qualquer falha reprova o job. Esta CI valida o software e as imagens, mas não testa a aplicação integrada com serviços externos reais nem realiza deploy.

## Estratégia de deploy adotada

A estratégia atual é a **recriação manual dos serviços via Docker Compose**, com breve indisponibilidade. Não é Blue-Green.

### Publicação manual (Deploy)

1.  Com Docker Desktop/Engine ativo e .env configurado (ver [docs/infraestrutura/docker-compose.md](../infraestrutura/docker-compose.md)), execute:

    `sh
    docker compose up --build -d
    `

2.  Confirme que os serviços estão saudáveis (docker compose ps) e valide os fluxos essenciais.

3.  **Atenção:** docker compose up --build -d é uma atualização/recriação que causa breve interrupção. Sempre faça backup antes.

### Rollback da aplicação

1.  Identifique o último commit/tag saudável.
2.  Volte ao commit/tag anterior (ex: git checkout <hash-do-commit-anterior>).
3.  Execute o deploy manual: docker compose up --build -d.
4.  Verifique e registre o rollback.

**Importante:** Rollback da aplicação **não reverte o banco automaticamente**. Só volte a versão se ela for compatível com o schema atual.

## Runbook de incidentes e recuperação

### Aplicação ou deploy indisponível

1.  Verifique docker compose ps e identifique serviços parados.
2.  Consulte logs com docker compose logs --tail=200 <serviço>.
3.  Verifique versão do código, .env e portas.
4.  Se falha após deploy, siga **Rollback da aplicação**. Caso contrário, corrija.
5.  Registre o incidente (início, impacto, causa, ações, recuperação).

### Banco indisponível ou suspeita de corrupção

1.  Preserve o volume MySQL. Interrompa gravações se houver risco de corrupção.
2.  Verifique o estado e logs do banco (docker compose ps urbancandy-db, docker compose logs --tail=200 urbancandy-db).
3.  Não execute docker compose down -v nem remova volumes.
4.  Faça backup do volume/dados atuais e valide a restauração em ambiente isolado.
5.  Restaure o backup aprovado em ambiente isolado.
6.  Valide a restauração e registre o resultado.

### Backup e Restauração (Visão Geral)

Não há rotina automática de backup. Antes de atualizações, realize backup manual do banco e uploads (UrbanCandy_back/uploads). A restauração deve ser ensaiada em ambiente isolado antes de impactar o ambiente ativo.

## Limitações e próximos passos para deploy remoto

-   CI está automatizada; publicação de imagens e deploy remoto não estão configurados por falta de servidor/destino aprovado.
-   Backup/restore continuam procedimentos manuais e ainda precisam de ensaio controlado e evidência registrada.
-   Para automatizar o deploy, primeiro definir servidor, domínio/TLS, armazenamento de secrets, acesso restrito do runner, política de retenção de backups e responsável por aprovar a publicação. Em seguida, implementar um ambiente protegido e validar deploy e rollback nesse destino antes de declarar o processo pronto para produção.
