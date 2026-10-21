# Execução local com Docker Compose

## Serviços e responsabilidades

| Serviço               | Função                                         | Comunicação                                                                                   |
| --------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `urbancandy-nginx`    | Entrada HTTP/HTTPS e proxy reverso             | Publica as portas do host; encaminha `/` ao frontend e `/api/` e `/uploads/` ao backend       |
| `urbancandy-frontend` | Build e servidor dos arquivos da aplicação web | Recebe tráfego do Nginx; usa `/api` para chamar a API pela mesma origem                       |
| `urbancandy-backend`  | API Express                                    | Conecta ao MySQL pelo host de serviço `urbancandy-db:3306`                                    |
| `urbancandy-db`       | MySQL 8                                        | Usa o banco isolado `urbancandy_docker` e o volume `mysql_data`                               |
| `urbancandy-redis`    | Cache distribuído de consultas de produtos      | Acessível apenas na rede Compose; o backend conecta em `urbancandy-redis:6379`               |

Os serviços se comunicam pela rede bridge privada `app_network`. O Nginx só
inicia depois que frontend e backend estiverem saudáveis; o backend aguarda o
health check do MySQL.

## Configuração inicial

Na raiz do repositório, copie `.env.example` para `.env` apenas se ainda não
tiver um `.env`. Se já existir, preserve-o e confira se `DB_PASSWORD` e
`JWT_SECRET` estão definidos. Não versione o `.env` nem certificados privados.

O Compose usa `DOCKER_DB_NAME=urbancandy_docker` e
`DOCKER_DB_USER=urbancandy_app` por padrão; estes valores não são retirados do
`.env` do backend nem do `.env.test`. Defina uma senha forte em `DB_PASSWORD`.
`MYSQL_ROOT_PASSWORD` deve ser outra senha forte; se for omitida, o Compose
reutiliza `DB_PASSWORD` para o usuário root do MySQL.

O Nginx espera `nginx/certs/cert.pem` e `nginx/certs/key.pem`. Esses arquivos
devem existir localmente e não devem ser commitados.

## Validar e iniciar

Execute na raiz do repositório:

```sh
docker compose config -q
docker compose up --build -d
docker compose ps
```

O MySQL é publicado em `localhost:3307` por padrão, enquanto o backend dentro
da rede Compose usa `urbancandy-db:3306`. O frontend e a API entram pelo Nginx
em `https://localhost` (ou `https://urbancandy.local` se esse nome estiver
configurado no arquivo hosts). O redirecionamento HTTP para HTTPS usa a porta
HTTPS padrão; se alterar a porta HTTPS publicada, acesse diretamente a porta
HTTPS configurada.

Se as portas MySQL, HTTP ou HTTPS já estiverem ocupadas, altere
`MYSQL_PORT`, `HTTP_PORT` ou `HTTPS_PORT` no `.env`. Redis não publica porta no
host para evitar conflitos e exposição desnecessária.

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
  agora usa Redis para Cache-Aside nas consultas de produtos. Pub/Sub continua
  fora desta etapa.
- Validação realizada: `docker compose --env-file .env.example config -q` e
  `docker compose build` passaram; os cinco serviços ficaram `healthy`;
  frontend e API responderam HTTP 200; `/api/health` retornou status `ok`;
  `nginx -t` passou.
- O gateway de pagamento não faz parte desta etapa.
