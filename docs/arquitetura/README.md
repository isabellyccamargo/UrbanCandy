# Arquitetura de Software

Índice da documentação organizada conforme os cinco grupos da rubrica. Cada
seção tem sua própria pasta; guias operacionais de infraestrutura permanecem em
[`../infraestrutura/`](../infraestrutura/).

## 1. Documentação arquitetural

Inclui os diagramas C4 disponíveis e os registros de decisões arquiteturais
(ADRs).

- [Diagramas C4 e ADRs](01-documentacao-arquitetural/)

## 2. Estilos arquiteturais e DDD

Inclui domínio e subdomínios, contextos conceituais, Context Map e o modelo de
domínio de Pedidos.

- [Documentos de DDD](02-estilos-arquiteturais-e-ddd/)

## 3. Integração, APIs e dados

Inclui o guia da API, a especificação OpenAPI dos principais endpoints e a ADR
que justifica o banco relacional.

- [API, OpenAPI e decisão de banco](03-integracao-apis-e-dados/)
- A especificação `openapi.yaml` permanece em
  [`UrbanCandy_back/docs/api/openapi.yaml`](../../UrbanCandy_back/docs/api/openapi.yaml).

## 4. Qualidade, resiliência e observabilidade

Inclui metas SLI/SLO, estratégias de resiliência, métricas, logs, Prometheus e
Grafana.

- [Qualidade e observabilidade](04-qualidade-resiliencia-observabilidade/)

## 5. Entrega contínua

Inclui o estado do pipeline, estratégia de deploy, rollback e runbook de
recuperação.

- [CI/CD e runbook](05-entrega-continua/)
