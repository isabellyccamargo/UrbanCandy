# Arquitetura de software — UrbanCandy

Esta documentação descreve a arquitetura observada no código e distingue funcionalidades implementadas de decisões ou metas ainda propostas. O código é a fonte de verdade para o comportamento.

## Documentação

- **Diagramas C4:** revisar e atualizar os diagramas Draw.io existentes com base na arquitetura implementada e nas regras C4.
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
- **Infraestrutura Compose:** MySQL, Redis, backend, serviço de e-mail, frontend e Nginx.

## Decisões e estado da rubrica

- Os ADRs registram decisões aceitas, propostas e seus estados; não são exclusivamente planos futuros.
- O backend principal é um monólito em camadas; seus diretórios não comprovam Bounded Contexts isolados. O serviço de e-mail é implantável separadamente.
- Os cenários de desempenho e disponibilidade são metas propostas, não medições ou garantias atuais.
- A especificação OpenAPI está no repositório. A exposição de Swagger UI em `/api-docs` não foi confirmada no servidor atual.
- A CI automatiza testes, builds e validação/construção das imagens Docker. Como ainda não há servidor remoto aprovado, o deploy pelo Compose é manual; publicação de imagens, deploy remoto automatizado e ensaio de restauração continuam pendentes.
- A rubrica C4 só poderá ser marcada como concluída após incorporar e revisar os diagramas de Contexto e Containers.
