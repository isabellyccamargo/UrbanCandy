# Como executar o UrbanCandy

Atualmente, o projeto pode estar rodando no modo Docker ou no modo local.

## Regra geral

Nao deixe backend ou frontend em Docker e local ao mesmo tempo. Use o Docker por completo ou use os dois projetos localmente.

## Executar com Docker

Na raiz do projeto, execute:

```powershell
.\scripts\start-docker.ps1
```

Se preferir iniciar manualmente:

```powershell
docker compose up -d
.\scripts\set-api-mode.ps1 -Mode docker

ou alteração de codigo
docker compose up --build -d
.\scripts\set-api-mode.ps1 -Mode docker
```

Acessos no modo Docker:

- Site: https://urbancandy.local
- API: http://localhost:3030
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090

## Executar localmente

Primeiro, pare os containers do projeto:

```powershell
docker compose down
```

Inicie o backend em um terminal:

```powershell
cd UrbanCandy_back
npm install
npm run dev
```

Em outro terminal, inicie o frontend:

```powershell
cd UrbanCandy_front
npm install
npm run dev
```

Por fim, configure o projeto para o modo local:

```powershell
.\scripts\set-api-mode.ps1 -Mode local
```

Acessos no modo local:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Voltar ao Docker

Pare os processos locais pressionando `Ctrl+C` nos terminais do backend e do frontend.

Depois, execute na raiz do projeto:

```powershell
.\scripts\start-docker.ps1
```

## Migrar os dados locais para o Docker

Com os bancos local e Docker ativos, execute na raiz do projeto:

```powershell
cd UrbanCandy_back
npm run migrate-db:docker
```

O script substitui no banco Docker os dados essenciais para demonstracoes, incluindo usuarios, pessoas, enderecos, cargos, permissoes, cardapio, ofertas e os status de pedido. Os IDs sao preservados para manter os relacionamentos.

Pedidos, itens de pedido, tentativas de pagamento, status de pedidos, outbox e notificacoes nao sao migrados.
