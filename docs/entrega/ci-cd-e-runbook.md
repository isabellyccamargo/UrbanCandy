# Entrega contínua e recuperação

## Escopo e estado

O workflow [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) executa
CI automaticamente em pull requests, pushes e também pode ser iniciado
manualmente. Ele instala as dependências pelo lockfile, executa testes,
compila backend, frontend e serviço de e-mail, valida o Compose e constrói as
imagens Docker das aplicações.

Ainda não há servidor de produção nem credenciais de deploy configuradas.
Portanto, o workflow **não publica imagens em um registry nem executa deploy
remoto**. A promoção de uma versão para o ambiente Docker disponível é manual,
após a CI passar. Não cadastrar credenciais de produção no workflow até existir
um destino e um ambiente de deploy aprovados.

## Pipeline de CI

1. **Disparo:** pull request, push em qualquer branch ou execução manual pelo
   GitHub Actions.
2. **Instalação:** `npm ci` usando `package-lock.json` e Node.js 20.
3. **Testes:** `npm run test:back`, `npm run test:front` e
   `npm run test:email` executam as suítes dos três serviços.
4. **Build:** `npm run build:check` compila/type-checka backend, frontend e
   serviço de e-mail.
5. **Infraestrutura:** `docker compose config -q` verifica a configuração e
   `docker compose build` constrói as imagens de backend, e-mail e frontend.
   As variáveis usadas nesta validação são valores fictícios exclusivos do CI,
   não secrets de produção.

Qualquer etapa com falha reprova o job; só integrar mudanças quando o workflow
estiver verde. O lint não está incluído na CI atual: `npm run quality:check`
também invoca o lint do frontend, que apresenta erros existentes de regra
React Hooks e precisa ser corrigido antes de tornar esse lint uma etapa
bloqueante. Esta CI valida o software e as imagens, mas não testa a aplicação
integrada com serviços externos reais nem realiza deploy.

## Estratégia de deploy adotada

Sem servidor remoto, a estratégia atual é **recriação manual dos serviços pelo
Docker Compose**, com possível breve indisponibilidade. Não é Blue-Green:
executa-se uma versão de cada serviço e não há roteador para alternar entre
duas pilhas. O procedimento é adequado ao ambiente local/de demonstração
existente; um deploy remoto automatizado exige escolher e preparar um servidor.

### Publicação manual

Execute na pasta do repositório, com Docker Desktop/mecanismo Docker ativo e
`.env` configurado conforme [`docs/infraestrutura/docker-compose.md`](../infraestrutura/docker-compose.md).
Confirme antes que a CI passou para o commit/versão que será publicado.

1. Registre a versão atual e crie backups do banco e dos uploads conforme
   **Backup antes de alterações** neste documento.
2. Atualize o checkout para o commit/tag aprovado, preservando o `.env` local.
3. Valide e construa os serviços:

   ```sh
   docker compose config -q
   docker compose up --build -d
   docker compose ps
   ```

4. Confirme que os serviços aparecem em execução e saudáveis. Valide
   `http://localhost/api/health` (ou `http://localhost:3030/api/health` para
   acessar o backend diretamente), a página web e os fluxos essenciais de
   leitura e gravação. Consulte `docker compose logs --tail=200 <serviço>` se
   houver falha.
5. Registre commit/tag, horário, resultado dos health checks e qualquer
   incidente. Não remova volumes para tentar corrigir uma falha.

`docker compose up --build -d` é uma atualização/recriação, não uma troca
Blue-Green; pode haver interrupção breve. Não execute isso contra dados
importantes sem backup validado e um plano de retorno compatível com o schema.

### Rollback da aplicação

1. Identifique o último commit/tag conhecido como saudável no registro de
   publicação.
2. No checkout de deploy, volte ao commit/tag anterior, sem alterar ou apagar o
   `.env`, volumes ou uploads.
3. Execute novamente `docker compose config -q` e
   `docker compose up --build -d`.
4. Verifique `docker compose ps`, `/api/health`, a página web e os logs dos
   serviços. Registre o rollback e seu motivo.

O rollback da aplicação **não reverte automaticamente o banco**. Só volte a
versão se ela for compatível com o schema atual. Alterações destrutivas de
schema exigem migração compatível com a versão anterior ou um plano de
restauração separado; não tente resolver incompatibilidade apagando volumes.

## Runbook de incidentes e recuperação

### Aplicação ou deploy indisponível

1. Verifique `docker compose ps` e identifique serviços parados ou não saudáveis.
2. Consulte `docker compose logs --tail=200 <serviço>` para backend, frontend,
   Nginx e dependências relevantes.
3. Confira se a versão do código, `.env`, certificados necessários e portas
   correspondem ao ambiente. Não copie nem publique valores secretos nos logs
   ou no relatório do incidente.
4. Se a falha começou após uma publicação, siga **Rollback da aplicação**.
   Caso contrário, corrija a causa e repita a validação de saúde.
5. Registre início, impacto, causa conhecida, ações, recuperação e versão final.

### Banco indisponível ou suspeita de corrupção

1. Preserve o volume MySQL. Se houver risco de corrupção, interrompa gravações
   e peça apoio antes de reiniciar repetidamente ou restaurar dados.
2. Verifique o estado com `docker compose ps urbancandy-db` e os logs com
   `docker compose logs --tail=200 urbancandy-db`.
3. Não execute `docker compose down -v`, não remova volumes e não restaure
   sobre a única cópia disponível.
4. Faça uma cópia do volume/backup atual e valide a restauração em ambiente
   isolado antes de tocar nos dados em uso.
5. Restaure somente o backup aprovado, documentando seu horário e o ponto de
   recuperação (RPO), que define quais gravações posteriores podem ser perdidas.
6. Inicie os serviços e valide conexão, leitura e gravação com um fluxo
   controlado. Registre o resultado e eventual perda de dados.

### Backup antes de alterações

O projeto não configura atualmente uma rotina automática de backup. Antes de
uma atualização que possa afetar dados, o responsável deve gerar e verificar
uma cópia externa do banco e do diretório `UrbanCandy_back/uploads`, guardar os
arquivos em local protegido e registrar horário e versão do sistema. Não
considere um arquivo de backup válido até verificar que não está vazio e que
pode ser lido/restaurado em ambiente isolado. Proteja os backups como dados
sensíveis e defina retenção e acesso restrito.

No PowerShell 7.4 ou posterior, com os serviços de banco saudáveis e a partir
da raiz do repositório, o exemplo abaixo cria dumps dos dois bancos e um arquivo
dos uploads fora do checkout. Ajuste o diretório de destino para um local
protegido com espaço suficiente:

```powershell
$backupRoot = Join-Path $env:USERPROFILE 'UrbanCandyBackups'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = Join-Path $backupRoot $stamp
New-Item -ItemType Directory -Force $backupDir | Out-Null

docker compose exec -T urbancandy-db sh -c 'export MYSQL_PWD="$MYSQL_PASSWORD"; exec mysqldump --single-transaction -u"$MYSQL_USER" "$MYSQL_DATABASE"' > (Join-Path $backupDir 'urbancandy.sql')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar o dump do banco principal.' }

docker compose exec -T urbancandy-email-db sh -c 'export MYSQL_PWD="$MYSQL_PASSWORD"; exec mysqldump --single-transaction -u"$MYSQL_USER" "$MYSQL_DATABASE"' > (Join-Path $backupDir 'urbancandy-email.sql')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar o dump do banco de e-mail.' }

tar -czf (Join-Path $backupDir 'uploads.tar.gz') -C .\UrbanCandy_back uploads
if ($LASTEXITCODE -ne 0) { throw 'Falha ao arquivar os uploads.' }

Get-ChildItem $backupDir | Select-Object Name, Length
```

Confirme que os três arquivos existem e têm tamanho maior que zero. A saída
`docker compose exec` não deve ser copiada para tickets se incluir mensagens
sensíveis. Esse comando cria cópias, mas não testa a restauração.

### Restauração controlada

Não restaure diretamente sobre o banco ativo como primeira tentativa. Preserve
os volumes e os arquivos atuais; prepare um ambiente isolado com volumes MySQL
novos, a mesma versão compatível da aplicação e acesso restrito. Importe cada
dump no respectivo banco isolado usando `mysql` via entrada padrão, extraia os
uploads para uma cópia separada e valide integridade e fluxos essenciais.
Somente depois de verificar a cópia e aprovar a janela de manutenção, planeje a
troca para os dados recuperados. Guarde intactos os dados originais até a
validação final. O procedimento ainda precisa ser ensaiado e registrado antes
de ser considerado recuperação testada.

## Limitações e próximos passos para deploy remoto

- CI está automatizada; publicação de imagens e deploy remoto não estão
  configurados por falta de servidor/destino aprovado.
- A estratégia atual é Compose com indisponibilidade breve; não há Blue-Green.
- Backup/restore continuam procedimentos manuais e ainda precisam de ensaio
  controlado e evidência registrada.
- Para automatizar o deploy, primeiro definir servidor, domínio/TLS,
  armazenamento de secrets, acesso restrito do runner, política de retenção de
  backups e responsável por aprovar a publicação. Em seguida, implementar um
  ambiente protegido e validar deploy e rollback nesse destino antes de
  declarar o processo pronto para produção.
