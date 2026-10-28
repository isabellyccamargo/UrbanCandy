# Docker Compose

Este guia cobre a execução local do UrbanCandy com Docker. Os detalhes de
cache, e-mail, notificações e pagamento estão nos guias específicos listados ao
final.

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
   `EMAIL_API_KEY`. Nunca versione o `.env`, certificados privados ou senhas.
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
