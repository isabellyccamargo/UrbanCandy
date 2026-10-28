# Documentação — UrbanCandy

Índice dos documentos de arquitetura, decisões e operação do projeto.

## Arquitetura e decisões

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
- [Dashboard de observabilidade com Grafana e Prometheus](observabilidade/grafana-prometheus.md)
- [Cache de produtos com Redis](infraestrutura/cache-redis.md)
- [Serviço de e-mail](infraestrutura/servico-email.md)
- [Eventos e notificações](infraestrutura/eventos-notificacoes.md)
- [Pagamento com Mercado Pago](infraestrutura/pagamento-mercado-pago.md)
