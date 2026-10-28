# Arquitetura de software — UrbanCandy

Esta documentação descreve a arquitetura observada no código e distingue funcionalidades implementadas de decisões ou metas ainda propostas. O código é a fonte de verdade para o comportamento.

## Documentação

- [Diagrama C4 de Contexto](arquitetura/c4-contexto.md)
- [Diagrama C4 de Containers](arquitetura/c4-containers.md)
- [Domínio e subdomínios](ddd/01-dominio-e-subdominios.md)
- [Bounded Contexts e Context Map](ddd/02-bounded-contexts-e-context-map.md)
- [Modelo do contexto Pedidos](ddd/03-modelo-do-contexto-pedidos.md)
- [ADRs](adr/)
- [Cenários de qualidade](qualidade/cenarios-de-qualidade.md)
- [Especificação OpenAPI](../UrbanCandy_back/docs/api/openapi.yaml)
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
- O workflow CI/CD e a documentação de deploy estão sendo entregues separadamente na branch `feature/ci-cd-docs`; nesta branch, deploy remoto e ensaio de restauração ainda não estão configurados.
- A rubrica C4 só poderá ser marcada como concluída após incorporar e revisar os diagramas de Contexto e Containers.
