# Docker Compose

Este guia cobre a execução local do UrbanCandy com Docker. Os detalhes de
cache, e-mail, notificações e pagamento estão nos guias específicos listados ao
final.

## Serviços do Compose

| Serviço                 | Função                                                                    | Comunicação                                                                             |
| ----------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `urbancandy-nginx`      | Entrada HTTP/HTTPS e proxy reverso                                        | Publica as portas do host; encaminha `/` ao frontend e `/api/` e `/uploads/` ao backend |
| `urbancandy-frontend`   | Build e servidor dos arquivos da aplicação web                            | Recebe tráfego do Nginx; usa `/api` para chamar a API pela mesma origem                 |
| `urbancandy-backend`    | API Express                                                               | Conecta ao MySQL pelo host de serviço `urbancandy-db:3306`                              |
| `urbancandy-db`         | MySQL 8                                                                   | Usa o banco isolado `urbancandy_docker` e o volume `mysql_data`                         |
| `urbancandy-redis`      | Cache de produtos e mensageria de pedidos                                 | Backend Compose usa `urbancandy-redis:6379`; backend local usa `127.0.0.1:6380`         |
| `urbancandy-email`      | Serviço independente de confirmação e envio de e-mails                    | Recebe atualizações dos pedidos via Redis Pub/Sub e usa SMTP do Gmail                   |
| `urbancandy-email-db`   | MySQL exclusivo do serviço de e-mail                                      | Persiste códigos de confirmação e tentativas de envio no volume `email_mysql_data`      |
| `urbancandy-prometheus` | Coleta métricas do backend, mantém histórico por 35 dias e avalia alertas | Acessa a porta interna `9464`; interface limitada ao loopback do host                   |
| `urbancandy-blackbox-exporter` | Executa probes HTTP de saúde da API | Acessível ao Prometheus pela rede privada do Compose |
| `urbancandy-grafana`    | Painel de métricas provisionado para UrbanCandy                           | Consulta Prometheus; interface limitada ao loopback do host                             |

## O que o Compose inicia

- **Aplicação:** frontend, backend, serviço de e-mail e Nginx.
- **Observabilidade:** Prometheus, probe de saúde da API e Grafana.
- **Dados:** MySQL principal (`urbancandy_docker`), MySQL de e-mail e Redis.
- **Rede:** os containers se comunicam pela rede privada `app_network`.
- **Persistência:** `mysql_data` guarda o banco principal e `email_mysql_data`
  guarda o banco de e-mail; `prometheus_data` mantém o histórico das métricas.

## Preparar e iniciar

1. Na raiz do projeto, copie `.env.example` para `.env` se ainda não existir.
   Preserve um `.env` já configurado.
2. Configure os valores necessários, incluindo `DB_PASSWORD`, `JWT_SECRET` e
   `EMAIL_API_KEY`, `GRAFANA_ADMIN_PASSWORD` e as credenciais do banco de
   e-mail. Use uma senha forte para o administrador do Grafana. Nunca versione
   o `.env`, certificados privados ou senhas.
3. Disponibilize os certificados locais esperados pelo Nginx:
   `nginx/certs/cert.pem` e `nginx/certs/key.pem`.
4. Inicie o ambiente:

   ```powershell
   .\scripts\start-docker.ps1
   ```

O script executa o Compose, seleciona o backend Docker e verifica a API. Para
usar `https://urbancandy.local`, configure esse nome para apontar ao computador
local no arquivo `hosts`; como alternativa, tente `https://localhost`.

## Usar o mesmo endereço com o backend local

Para desenvolver com o banco local, inicie o MySQL local e rode `npm run dev`
na pasta `UrbanCandy_back`. O comando seleciona o backend local para
`https://urbancandy.local`; o frontend e o Nginx continuam no Compose.

Para voltar ao backend Docker, execute novamente
`.\scripts\start-docker.ps1`. Essa seleção de backend não migra nem modifica
dados. Detalhes de conexão do backend local estão em
[`UrbanCandy_back/.env.example`](../../UrbanCandy_back/.env.example).

## Portas principais

- `80` e `443`: HTTP/HTTPS publicados pelo Nginx.
- `3307`: MySQL principal no host; internamente, os containers usam `3306`.
- `3308`: MySQL de e-mail, acessível somente pelo computador local.
- `3030`: API Docker para acesso direto, por exemplo, pelo aplicativo mobile.
- `3041`: serviço de e-mail Docker no host; internamente usa `3040`.
- `6380`: Redis publicado somente no loopback; internamente usa `6379`.
- `3001` e `9090`: Grafana e Prometheus, publicados somente no loopback.

As portas publicadas podem ser alteradas no `.env` raiz com `HTTP_PORT`,
`HTTPS_PORT`, `MYSQL_PORT`, `BACKEND_PORT`, `EMAIL_SERVICE_PORT` e
`REDIS_PORT`. As portas de observabilidade podem ser ajustadas com
`GRAFANA_PORT` e `PROMETHEUS_PORT`.

## Acesso pelo aplicativo mobile

Para acessar o backend Docker em um celular físico, configure
`EXPO_PUBLIC_API_URL` no `UrbanCandy_mobile/.env` com
`http://<IP-do-computador>:3030`. O celular e o computador precisam estar na
mesma rede, e o firewall deve permitir a conexão. O backend local usa a porta
`3000`; no emulador Android padrão, o endereço é `http://10.0.2.2:3000`.

## Verificar, acompanhar e parar

```powershell
docker compose ps
```

Com os serviços saudáveis, o painel está em `http://localhost:3001` (usuário
`GRAFANA_ADMIN_USER`, padrão `admin`; senha `GRAFANA_ADMIN_PASSWORD`). O
dashboard **UrbanCandy - API overview** é provisionado automaticamente.
Prometheus fica em `http://localhost:9090`; a página **Status > Rules** exibe
os alertas configurados. Ambas as portas são publicadas somente em `127.0.0.1`.
O endpoint de métricas do backend escuta na porta interna `9464`, sem publicação
no host e sem rota pelo Nginx; Prometheus acessa-o apenas pela rede privada do
Compose.

As métricas HTTP usam rótulos de rota Express, método e status (não IDs,
query strings, tokens ou dados pessoais), com duração em histogramas. Métricas
de dependência registram sucesso/falha e duração de chamadas observadas a
ViaCEP, serviço de e-mail e Mercado Pago. O processo também publica métricas
padrão do Node.js. Logs de requisição estruturados são enviados para stdout e
incluem método, rota normalizada, status e duração, nunca o corpo ou credenciais.
Os alertas Prometheus cobrem backend sem coleta, taxa de 5xx acima de 1%, p95
do catálogo acima de 500 ms e circuito ViaCEP aberto. Alertas ficam disponíveis
no Prometheus; notificações por e-mail ou chat não estão configuradas.

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

Para parar os containers sem apagar os dados:

```powershell
docker compose down
```

**Não use `docker compose down -v` para uma parada normal:** a opção `-v`
remove os volumes do Compose e apaga os dados persistidos nos bancos Docker.
Bancos MySQL instalados fora do Compose não são afetados.

## Guias relacionados

- [Cache de produtos com Redis](cache-redis.md)
- [Serviço de e-mail](servico-email.md)
- [Eventos e notificações](eventos-notificacoes.md)
- [Pagamento com Mercado Pago](pagamento-mercado-pago.md)
