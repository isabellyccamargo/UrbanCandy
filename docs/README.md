# Documentação — UrbanCandy

Índice dos documentos de arquitetura, decisões e operação do projeto.

## Arquitetura e decisões

- [Diagrama C4 de Contexto](arquitetura/c4-contexto.md)
- [Diagrama C4 de Containers](arquitetura/c4-containers.md)
- **Diagramas C4:** os diagramas Draw.io de Contexto e Containers estão pendentes de revisão e atualização conforme a arquitetura implementada.
- [Domínio e subdomínios](ddd/01-dominio-e-subdominios.md)
- [Bounded Contexts e Context Map](ddd/02-bounded-contexts-e-context-map.md)
- [Modelo do contexto Pedidos](ddd/03-modelo-do-contexto-pedidos.md)
- [ADRs](adr/)
- [Cenários de qualidade](qualidade/cenarios-de-qualidade.md)
- [Documentação da API (Swagger e OpenAPI)](api/documentacao-api.md)

## Infraestrutura e operação

- [Estado de CI/CD e runbook](entrega/ci-cd-e-runbook.md)
- [Orquestração local e Docker Compose](infraestrutura/docker-compose.md)

## Resumo arquitetural atual

- **Web:** React e Vite.
- **Mobile:** Expo, React Native e TypeScript.
- **Backend principal:** Node.js, Express, TypeScript, organizado em camadas e implantado como uma aplicação única.
- **Serviço de e-mail:** aplicação Express separada, com banco próprio; consome eventos de pedido via Redis Pub/Sub e executa um worker de entrega.
- **Persistência:** MySQL com Sequelize. O backend principal e o serviço de e-mail usam bancos separados.
- **Redis:** cache-aside do catálogo no backend e Pub/Sub/outbox para eventos de status de pedidos.
- **Pagamento:** integração implementada com Mercado Pago no backend principal. O checkout persiste uma tentativa e usa webhook assinado e consulta de status; não há worker de pagamento separado.
- **Infraestrutura Compose:** MySQL, Redis, backend, serviço de e-mail, frontend, Nginx, Prometheus e Grafana.

## Decisões e estado da rubrica

- Os ADRs registram decisões aceitas, propostas e seus estados; não são exclusivamente planos futuros.
- O backend principal é um monólito em camadas; seus diretórios não comprovam Bounded Contexts isolados. O serviço de e-mail é implantável separadamente.
- As métricas HTTP, coleta Prometheus, dashboard Grafana e regras de alerta estão configuradas para execução local; as metas de SLO ainda dependem de aprovação e validação por testes de carga e observação.
- A especificação OpenAPI documenta os principais fluxos da API. Swagger UI está disponível em `/api-docs` na porta do backend (local: `http://localhost:3000/api-docs`; Compose: `http://localhost:3030/api-docs`).
- O workflow CI/CD e o runbook de deploy estão documentados em [Estado de CI/CD e runbook](entrega/ci-cd-e-runbook.md); deploy remoto e ensaio de restauração ainda dependem de configuração e validação.
- A rubrica C4 só poderá ser marcada como concluída após incorporar e revisar os diagramas de Contexto e Containers.
- [Dashboard de observabilidade com Grafana e Prometheus](observabilidade/grafana-prometheus.md)
- [Cache de produtos com Redis](infraestrutura/cache-redis.md)
- [Serviço de e-mail](infraestrutura/servico-email.md)
- [Eventos e notificações](infraestrutura/eventos-notificacoes.md)
- [Pagamento com Mercado Pago](infraestrutura/pagamento-mercado-pago.md)
