# Execução local com Docker Compose

## Serviços e responsabilidades

| Serviço               | Função                                         | Comunicação                                                                             |
| --------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| `urbancandy-nginx`    | Entrada HTTP/HTTPS e proxy reverso             | Publica as portas do host; encaminha `/` ao frontend e `/api/` e `/uploads/` ao backend |
| `urbancandy-frontend` | Build e servidor dos arquivos da aplicação web | Recebe tráfego do Nginx; usa `/api` para chamar a API pela mesma origem                 |
| `urbancandy-backend`  | API Express                                    | Conecta ao MySQL pelo host de serviço `urbancandy-db:3306`                              |
| `urbancandy-db`       | MySQL 8                                        | Usa o banco isolado `urbancandy_docker` e o volume `mysql_data`                         |
| `urbancandy-redis`    | Cache de produtos e mensageria de pedidos      | Backend Compose usa `urbancandy-redis:6379`; backend local usa `127.0.0.1:6380`         |
| `urbancandy-email`    | Serviço independente de confirmação e envio de e-mails | Recebe atualizações dos pedidos via Redis Pub/Sub e usa SMTP do Gmail |
| `urbancandy-email-db` | MySQL exclusivo do serviço de e-mail            | Persiste códigos de confirmação e tentativas de envio no volume `email_mysql_data`       |

Os serviços se comunicam pela rede bridge privada `app_network`. O Nginx só
inicia depois que frontend e backend estiverem saudáveis; o backend aguarda o
health check do MySQL.

## Configuração inicial

Na raiz do repositório, copie `.env.example` para `.env` apenas se ainda não
tiver um `.env`. Se já existir, preserve-o e confira as configurações de banco,
`JWT_SECRET`, `EMAIL_API_KEY` e as credenciais do banco de e-mail. Não versione
o `.env` nem certificados privados.

O Compose usa `DOCKER_DB_NAME=urbancandy_docker` e
`DOCKER_DB_USER=urbancandy_app` por padrão; estes valores não são retirados do
`.env` do backend nem do `.env.test`. Defina uma senha forte em `DB_PASSWORD`.
`MYSQL_ROOT_PASSWORD` pode ser definida separadamente; se for omitida, o Compose
reutiliza `DB_PASSWORD` para o usuário root do MySQL. O serviço de e-mail usa
um container, banco e volume próprios. Para não exigir novas configurações
iniciais, ele reutiliza `DB_PASSWORD` como senha do usuário de aplicação e a
senha root existente como padrão; é possível definir `EMAIL_DB_PASSWORD` e
`EMAIL_DB_ROOT_PASSWORD` separadamente depois. O banco de e-mail é publicado em
`localhost:3308` (o `3306` é apenas a porta interna do container). `EMAIL_API_KEY`
deve ser uma chave
aleatória compartilhada apenas entre o backend principal e o serviço de e-mail.
Para envio real com Gmail, configure `SMTP_USER` com a conta remetente,
`SMTP_APP_PASSWORD` com a senha de app e `SMTP_FROM` com o endereço autorizado.
Nunca use a senha normal da conta nem versione a senha de app.

O Nginx espera `nginx/certs/cert.pem` e `nginx/certs/key.pem`. Esses arquivos
devem existir localmente e não devem ser commitados.

## Validar e iniciar

Execute na raiz do repositório:

```sh
docker compose config -q
docker compose up --build -d
docker compose ps
```

O Compose inicia um backend e um banco separados para o envio de e-mails. O
MySQL de e-mail é publicado apenas no loopback pela porta `3308` e persiste no
volume `email_mysql_data`; não é o banco principal nem o banco de testes. O
serviço de e-mail fica disponível no host pela porta `3040` e na rede Compose
como `urbancandy-email:3040`.

O MySQL principal é publicado em `localhost:3307` por padrão, e o MySQL do
serviço de e-mail em `localhost:3308`; ambos usam a porta interna `3306` em
containers separados. O backend dentro da rede Compose usa `urbancandy-db:3306`.
O backend e o serviço de e-mail locais usam, respectivamente, as portas `3000`
e `3040`; no Compose, o backend usa `3030` e o serviço de e-mail fica acessível
ao host na porta `3041` (internamente, entre containers, continua na `3040`).
O frontend e a API entram pelo Nginx
em `https://localhost` (ou `https://urbancandy.local` se esse nome estiver
configurado no arquivo hosts). O redirecionamento HTTP para HTTPS usa a porta
HTTPS padrão; se alterar a porta HTTPS publicada, acesse diretamente a porta
HTTPS configurada.

Se as portas MySQL, backend, HTTP, HTTPS ou Redis já estiverem ocupadas, altere
`MYSQL_PORT`, `BACKEND_PORT`, `HTTP_PORT`, `HTTPS_PORT` ou `REDIS_PORT` no
`.env`. O backend Compose fica disponível na porta `3030` do computador para
que o aplicativo mobile em um celular físico consiga acessá-lo. A porta
publicada do Redis fica limitada ao loopback (`127.0.0.1`): ela permite que um
backend executado diretamente no computador acesse o Redis do Compose, sem
disponibilizá-lo para outros dispositivos da rede.

### Backend local com o aplicativo mobile

Para desenvolver no celular sem conectar o backend ao MySQL do Compose:

1. Inicie somente o Redis do Compose com `docker compose up -d urbancandy-redis`.
2. No arquivo local `UrbanCandy_back/.env`, mantenha a configuração do MySQL de
   desenvolvimento e defina `REDIS_URL=redis://127.0.0.1:6380`. O modelo de
   configuração está em `UrbanCandy_back/.env.example`. Se `REDIS_PORT` foi
   alterado no `.env` da raiz, use a porta correspondente no `REDIS_URL`.
3. Inicie a API local normalmente. Para o emulador Android padrão, o mobile já
   usa `http://10.0.2.2:3000`. Em um celular físico com backend rodando no
   Compose, configure `EXPO_PUBLIC_API_URL` no arquivo
   `UrbanCandy_mobile/.env` como `http://<IP-do-computador>:3030`. Se estiver
   usando backend local, use a porta `3000`. O celular e computador precisam
   estar na mesma rede, e o firewall deve permitir a conexão.

O Redis não é o banco de dados: o backend local continua usando o MySQL indicado
em `UrbanCandy_back/.env`; o backend do Compose continua usando
`urbancandy-db:3306`. Assim, iniciar o Redis para Pub/Sub/cache não mistura os
bancos de desenvolvimento e Compose.

Verifique os estados `healthy` com `docker compose ps`; depois confirme
`https://localhost/api/health` e a página inicial. Para acompanhar falhas:

```sh
docker compose logs --tail=100
docker compose logs --follow urbancandy-backend
```

## Cache distribuído de produtos

O backend usa Cache-Aside com Redis nas consultas públicas de produtos:
listagem paginada, destaques, busca por categoria e busca por ID. O tempo de
expiração padrão é de 60 segundos e pode ser alterado por
`PRODUCT_CACHE_TTL_SECONDS` no `.env` da raiz. As chaves usam o prefixo
`urbancandy:products:`.

Ao criar, atualizar ou excluir um produto, o backend invalida as chaves de
produto. Alterações em categorias também invalidam esse conjunto, pois as
consultas incluem os dados da categoria. Os logs do backend registram `MISS`,
`HIT`, gravações com TTL e invalidações. Se Redis ficar indisponível, o backend
registra o erro e consulta o banco; a API continua disponível, mas sem cache.

Para demonstrar o comportamento, com os serviços em execução:

1. Acompanhe `docker compose logs --follow urbancandy-backend`.
2. Acesse duas vezes `https://localhost/api/produto/listar`. O primeiro acesso
   deve registrar `MISS` e gravação; o segundo deve registrar `HIT`.
3. Confira as chaves com
   `docker compose exec urbancandy-redis redis-cli --scan --pattern "urbancandy:products:*"`.
4. Crie, edite ou exclua um produto pela aplicação. O log deve registrar a
   invalidação; ao consultar novamente, a API carrega os dados atualizados e
   preenche o cache novamente.

Os testes automatizados de `Cache-Aside` cobrem cache miss, hit e fallback
quando Redis não pode ser acessado.

## Serviço de confirmação e envio de e-mails

O backend principal grava cada mudança de status do pedido na tabela
`order_status_outbox`, na mesma transação que atualiza o pedido. Um publicador
reenviará o evento pelo Redis Pub/Sub até o serviço de e-mail registrar o evento
em seu banco e publicar a confirmação de recebimento. O identificador do evento
é único; assim, reentregas não criam novos envios. O serviço persiste os e-mails
pendentes e tenta novamente falhas SMTP com intervalo crescente. O cliente só
recebe atualizações do pedido depois de confirmar o endereço uma vez; a
confirmação não bloqueia o login nem as compras. As contas existentes podem
solicitar o código em “Meus Dados”.

Para desenvolver localmente:

1. Crie o banco MySQL `urbancandy_email_development` no MySQL local, sem
   reutilizar `urbancandy` ou `urbancandy_test`.
2. Copie `UrbanCandy_email/.env.example` para `UrbanCandy_email/.env` e ajuste
   host/usuário/senha do banco. Configure `EMAIL_API_KEY` com o mesmo valor
   usado em `UrbanCandy_back/.env`.
3. Em `UrbanCandy_back/.env`, defina
   `EMAIL_SERVICE_URL=http://127.0.0.1:3040` e a mesma `EMAIL_API_KEY`.
4. Para Gmail, ative a verificação em duas etapas da conta remetente, gere uma
   senha de app e configure `SMTP_USER`, `SMTP_APP_PASSWORD` e `SMTP_FROM` no
   `UrbanCandy_email/.env`. Sem essas credenciais, o serviço permanece
   executável, mas os envios ficam pendentes e serão tentados novamente.
5. Inicie Redis, backend e serviço de e-mail em terminais separados:

   ```sh
   npm run dev:email
   npm run dev:back
   ```

   O Redis pode ser iniciado com `docker compose up -d urbancandy-redis`.

O banco de testes do serviço deve ser `urbancandy_email_test`; o arquivo modelo
está em `UrbanCandy_email/.env.test.example`. Os testes do serviço usam um
transporte SMTP simulado e não enviam e-mails reais. A senha de app jamais deve
ser copiada para `.env.example`, `.env.test.example` ou qualquer arquivo
versionado.

Os ambientes local e Compose podem ficar ativos ao mesmo tempo: o local usa os
canais Redis padrão, e o Compose usa canais com o prefixo
`urbancandy:docker:`. Assim, cada serviço de e-mail consome somente os eventos
do backend do mesmo ambiente.

## Eventos com Redis Pub/Sub

O backend publica o evento `order.status.changed` no canal
`urbancandy:orders:status-changed` depois que o status de um pedido é alterado
com sucesso ou cancelado. A mensagem contém `eventId`, `occurredAt`, `orderId`,
`previousStatusId` e `newStatusId`. Um assinante Redis iniciado com o backend
consome o evento e registra a publicação, assinatura e consumo nos logs.
Quando o status recebido contém "pronto", o consumidor grava uma notificação
associada ao usuário e ao pedido; ela só é enviada ao dono do pedido.

No aplicativo mobile, o sino do cabeçalho abre o histórico de notificações,
com contador de não lidas e ações para marcar uma ou todas como lidas. Com o
app aberto, a tela consulta novas notificações a cada 10 segundos e mostra um
aviso na tela; ao retornar do segundo plano, consulta novamente. As
notificações ficam salvas no MySQL e continuam no histórico após reiniciar o
app. Isso não é uma notificação push do sistema operacional: com o app fechado,
o aviso só aparece quando ele for aberto novamente.

As rotas autenticadas `GET /api/notificacoes`,
`PATCH /api/notificacoes/:id_notification/lida` e
`PATCH /api/notificacoes/lidas` servem o histórico e a leitura. A rota
`GET /api/notificacoes/stream` oferece Server-Sent Events para uma futura
interface web.

Para demonstrar a circulação:

1. Acompanhe `docker compose logs --follow urbancandy-backend`.
2. Altere o status de um pedido pela aplicação.
3. Confira os logs `[pubsub] Publicado`, `[pubsub] Assinante conectado` e
   `[pubsub] Consumido`, com o identificador e a transição do pedido.
4. Opcionalmente, observe o canal com
   `docker compose exec urbancandy-redis redis-cli MONITOR` em outro terminal.

Pub/Sub não armazena mensagens nem garante entrega a consumidores
desconectados. Este fluxo demonstra comunicação por eventos; notificações
críticas que não podem ser perdidas exigirão uma fila durável/outbox.

## Pagamento com Mercado Pago

No mobile, a pessoa escolhe entre dinheiro na entrega/retirada e pagar pelo
Mercado Pago. O Checkout Pro hospedado oferece os meios habilitados para a
conta, como Pix e cartões; os dados do cartão não passam nem ficam armazenados
no UrbanCandy. Ao fechar o checkout sem concluir, a tela de pagamento permanece
aberta e permite retomar o checkout enquanto consulta a confirmação. O backend
calcula os preços a partir do MySQL e mantém a tentativa de pagamento separada
do pedido. O pedido só é criado com status "Recebido" após o Mercado Pago
confirmar a aprovação.

Para testar:

1. Configure `MERCADOPAGO_ACCESS_TOKEN` com uma credencial de teste do vendedor
   no `.env` da raiz (Compose) ou em `UrbanCandy_back/.env` (backend local).
   Não compartilhe nem versione esse token.
   Credenciais com prefixo `TEST-` usam exclusivamente a URL sandbox do
   Checkout Pro; o backend não redireciona essas credenciais para o checkout de
   produção.
   Em desenvolvimento, uma credencial de produção `APP_USR-` também pode ser
   usada intencionalmente; nesse caso, os pagamentos são reais e podem cobrar
   dinheiro. Use-a somente quando estiver ciente desse risco.
2. Para confirmação automática por webhook, configure
   `MERCADOPAGO_WEBHOOK_SECRET` e `MERCADOPAGO_WEBHOOK_URL` com os valores da
   aplicação no painel de desenvolvedores do Mercado Pago. A URL precisa ser
   HTTPS e publicamente acessível, apontando para
   `/api/pagamento/webhook`. Sem webhook, a tela de resultado consulta o status
   ao Mercado Pago enquanto permanecer aberta.
3. Use um usuário comprador de teste do Mercado Pago e siga o fluxo no app. A
   tela de resultado mostra a aprovação, rejeição ou estado pendente. Não use
   dados de cartão reais em testes.

As rotas autenticadas `POST /api/pagamento/checkout` e
`GET /api/pagamento/checkout/:id` iniciam e consultam a tentativa. O endpoint
`POST /api/pagamento/webhook` valida a assinatura e consulta o pagamento
diretamente à API Mercado Pago antes de aprovar o pedido. A tentativa registra
o snapshot dos produtos e valores usados no checkout; preços e total enviados
pelo app não são considerados fonte confiável.

Para parar os containers sem apagar dados:

```sh
docker compose down
```

O volume `mysql_data` mantém os dados do banco do Compose. O comando abaixo
apagaria permanentemente esse banco e seu volume; não o execute sem querer
remover os dados locais do Compose. Ele não remove bancos externos ao Compose.

```sh
docker compose down -v
```

## Estado da rubrica

- Compose, containers do frontend e backend, MySQL, Nginx, rede e volume
  isolados: configurados e validados em execução.
- Banco: o backend foi confirmado conectado ao schema `urbancandy_docker`;
  a porta publicada no host é `3307` por padrão, separada dos bancos locais
  de desenvolvimento e de testes.
- Redis: container e health check configurados e validados (`PONG`); o backend
  usa Redis para Cache-Aside nas consultas de produtos e Pub/Sub para eventos
  de alteração de status do pedido.
- Validação realizada: `docker compose --env-file .env.example config -q` e
  `docker compose build` passaram; os cinco serviços ficaram `healthy`;
  frontend e API responderam HTTP 200; `/api/health` retornou status `ok`;
  `nginx -t` passou.
- A integração Mercado Pago é uma etapa separada da rubrica; requer credenciais
  de teste para validar o checkout real no ambiente sandbox.
