# Roteiro de apresentação — rubrica do UrbanCandy

Este roteiro segue a ordem da apresentação: visão do projeto e gestão, demonstração
funcional, documentação arquitetural na ordem da rubrica e, por fim, Jira. Mostre
os artefatos e explique sua finalidade sem ler os documentos integralmente.

## 1. Apresentação do UrbanCandy e gestão

O UrbanCandy é uma plataforma de e-commerce de doces, acessível pela Web e por
aplicativo Mobile. As duas interfaces usam a mesma API. O backend principal é
um monólito organizado em camadas; o serviço de e-mail é uma aplicação separada.

O Cynefin é um framework para interpretar o contexto e orientar a resposta de
gestão, não uma metodologia de desenvolvimento. O contexto predominante do
UrbanCandy foi classificado como **Complexo**, pois algumas soluções ficam mais
claras ao implementar, observar e receber feedback. A abordagem escolhida é
**híbrida**: planejamento inicial e acompanhamento de escopo e riscos, junto
com desenvolvimento incremental e adaptação. Consulte a
[análise Cynefin e abordagem](gestao-projeto/analise-cynefin-e-abordagem-de-gestao.md).

O [PM Canvas](gestao-projeto/pm-canvas-urbancandy.svg) registra a visão geral e
o planejamento inicial. O [ciclo de vida](gestao-projeto/ciclo-de-vida-e-pm-canvas.md)
organiza o projeto em **iniciação**, **planejamento**, **execução**,
**monitoramento e controle** e **encerramento**. Durante a execução, o
[Product Backlog](gestao-projeto/product-backlog-urbancandy.md) representado
no Jira organiza e prioriza o trabalho em incrementos. Assim, os artefatos se
complementam: Canvas para a visão inicial; backlog para acompanhar o trabalho
priorizado.

Isabelly Camargo acumula as responsabilidades de gerente de projeto, Scrum
Master/facilitadora, analista e desenvolvedora. Ao falar de versões, esclareça
que v1.0.0, v1.1.0 e v2.0.0 são grupos **planejados** de entregas, não releases
que necessariamente já foram publicadas.

## 2. Demonstração funcional

### Compra e atualização de pedido

Na tela do cliente, escolha um produto, adicione-o ao carrinho e finalize o
pedido com uma conta de teste cujo e-mail esteja confirmado. Use pagamento em
Dinheiro, se disponível, para mostrar a criação do pedido sem iniciar uma
cobrança. O backend valida os dados e calcula o total; o pedido começa como
“Recebido”.

Depois, acesse a área de funcionário, abra o pedido e altere o status pela
interface. Não altere o status diretamente no banco. Dinheiro não demonstra a
integração financeira com o Mercado Pago, e o QR Pix ilustrativo do ambiente
de desenvolvimento não é pagável.

### Mensageria e serviço de e-mail

Explique o fluxo: a mudança de status gera um evento; o backend publica usando
Redis Pub/Sub e a outbox mantém eventos pendentes para nova tentativa; o
serviço de e-mail persiste a entrega e confirma o recebimento. O ACK indica
persistência pelo serviço, não envio. Para comprovar envio, mostre também o
registro `Sent`. O serviço de e-mail é uma aplicação separada e implantável
independentemente. Consulte [eventos e notificações](infraestrutura/eventos-notificacoes.md).
O projeto usa Redis Pub/Sub com outbox, não RabbitMQ para esse fluxo.

### Cache, logs e Docker/Nginx

No terminal do backend no VS Code ou nos logs do container, consulte o catálogo
duas vezes: explique `MISS` seguido de `HIT` para mostrar Cache-Aside. Se
possível, edite um produto e mostre a invalidação. Consulte o [guia de cache Redis](infraestrutura/cache-redis.md).
Isso demonstra o fluxo do cache, não um benchmark de redução de latência.

Mostre o Docker Compose e explique que ele orquestra a aplicação e suas
dependências. O Nginx atua como proxy reverso, encaminhando as requisições ao
frontend e à API. O ambiente local é uma demonstração; não o apresente como
hospedagem permanente de produção. Consulte o [guia Docker Compose](infraestrutura/docker-compose.md).

## 3. Documentação no GitHub — ordem da rubrica

Apresente cada grupo brevemente: diga para que serve, mostre os artefatos e
avance para o próximo. A documentação detalhada está indexada em
[Arquitetura de Software](arquitetura/README.md).

### 3.1 Documentação arquitetural: C4, ADRs e cenários de qualidade

Mostre os [diagramas C4 de contexto e contêineres](arquitetura/01-documentacao-arquitetural/)
para explicar os limites e componentes principais. Mostre as
[ADRs arquiteturais](arquitetura/01-documentacao-arquitetural/) para explicar
decisões e alternativas, incluindo a decisão do backend em camadas. Os
[cenários de qualidade](arquitetura/01-documentacao-arquitetural/cenarios-de-qualidade.md)
especificam estímulo, resposta e medidas esperadas para desempenho e disponibilidade.

### 3.2 Estilos arquiteturais e DDD

Mostre [domínio e subdomínios](arquitetura/02-estilos-arquiteturais-e-ddd/01-dominio-e-subdominios.md),
[Context Map](arquitetura/02-estilos-arquiteturais-e-ddd/02-bounded-contexts-e-context-map.md)
e [modelo de Pedidos](arquitetura/02-estilos-arquiteturais-e-ddd/03-modelo-do-contexto-pedidos.md).
Explique que
Usuários, Catálogo e Pedidos são limites conceituais propostos para organizar o
domínio; não diga que já são módulos DDD isolados no código. Apresente entidades,
Value Objects e agregado de Pedidos conforme o documento, distinguindo o que é
implementado do que é modelo proposto.

### 3.3 Integração, APIs e dados

Mostre o [OpenAPI](../UrbanCandy_back/docs/api/openapi.yaml)/Swagger para
consultar os principais endpoints e a [ADR do MySQL](arquitetura/03-integracao-apis-e-dados/ADR-005-escolha-banco-de-dados.md)
para explicar a escolha do banco relacional e o uso de transações. Não
afirme que houve benchmark comparativo entre bancos.

### 3.4 Qualidade, resiliência e observabilidade

Mostre o documento de [qualidade e resiliência](arquitetura/04-qualidade-resiliencia-observabilidade/cenarios-de-qualidade.md),
as [metas SLI/SLO e observabilidade](arquitetura/04-qualidade-resiliencia-observabilidade/grafana-prometheus.md),
estratégias como timeout, retry, circuit breaker, logs e o dashboard
Prometheus/Grafana. As metas de desempenho e disponibilidade
são propostas e não devem ser apresentadas como resultados medidos. Os testes
automatizados demonstram comportamentos específicos, mas não comprovam por si
sós as integrações reais nem um SLO de 30 dias.

### 3.5 Entrega contínua

Mostre o [workflow de CI](arquitetura/05-entrega-continua/ci-cd-e-runbook.md),
a estratégia simples de deploy, rollback e runbook.
O deploy no GitHub Actions sobe os serviços temporariamente no runner para
validação e encerra os containers; não mantém o site hospedado após o workflow.
Não há estratégia Blue-Green.

### 3.6 Back-end Avançado: cache, mensageria, Docker e observabilidade

Relacione a demonstração prática aos documentos: Cache-Aside com TTL e
invalidação; Redis Pub/Sub com outbox e serviço de e-mail; Docker Compose com
Nginx como proxy reverso; e logs/métricas para acompanhar o sistema. O ACK do
evento confirma persistência, enquanto `Sent` é a evidência de envio SMTP.

## 4. Jira: fluxo de trabalho

Finalize mostrando o quadro e os cards do Jira. Explique que o Jira é a
ferramenta e que os cards priorizados representam o Product Backlog. Mostre
uma User Story e destaque descrição no formato “Como…, quero…, para…”,
prioridade, responsável, estado, critérios de aceite e evidências ou links.
Explique como os estados do quadro tornam o progresso visível.

Não afirme que foram realizadas Sprints ou cerimônias Scrum se isso não estiver
registrado. Se um card mencionar RabbitMQ, corrija-o: o fluxo de pedidos usa
Redis Pub/Sub com outbox. Só diga que houve repriorização quando puder apontar
um exemplo real no Jira.

## Fechamento

Em síntese: o UrbanCandy combina planejamento inicial com entregas
incrementais; demonstra uma compra e a atualização de um pedido; e documenta
arquitetura, integração, qualidade, entrega e acompanhamento do trabalho.
Durante toda a apresentação, diferencie funcionalidades implementadas,
modelos conceituais, metas propostas e entregas planejadas.
