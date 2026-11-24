## 1. Apresentação do UrbanCandy e gestão

> “O UrbanCandy é uma plataforma de e-commerce de doces. Temos uma interface
> Web e um aplicativo Mobile, e os dois usam a mesma API. O backend principal
> é um monólito organizado em camadas, e o serviço de e-mail é separado.”

> “Nossa análise diante o Cynefin considera o contexto predominantemente Complexo 
> porque algumas necessidades e soluções ficam mais claras enquanto implementamos, 
> observamos e recebemos feedback. Por isso, escolhemos uma gestão híbrida: fazemos 
> planejamento inicial e acompanhamos riscos, mas também desenvolvemos em incrementos e
> podemos adaptar o trabalho.”

> “O PM Canvas registra a visão geral e o planejamento inicial. O ciclo de
> vida organiza o projeto em iniciação, planejamento, execução, monitoramento
> e controle, e encerramento. Durante a execução, usamos o Product Backlog
> representado no Jira para organizar e priorizar o trabalho. Então, o Canvas
> ajuda a planejar a visão do projeto e o backlog ajuda a acompanhar as
> entregas.”

Mostre a [análise Cynefin e abordagem](gestao-projeto/analise-cynefin-e-abordagem-de-gestao.md),
o [PM Canvas visual](gestao-projeto/pm-canvas-urbancandy.svg) e o
[ciclo de vida](gestao-projeto/ciclo-de-vida-e-pm-canvas.md). Isabelly Camargo
acumula as responsabilidades de gerente de projeto, Scrum Master/facilitadora,
analista e desenvolvedora. As versões v1.0.0, v1.1.0 e v2.0.0 são grupos
planejados de entregas, não releases necessariamente publicadas.

## 2. Demonstração funcional

Antes de abrir o navegador, prepare o ambiente Docker na raiz do projeto.
Se os containers já estão construídos, use o comando rápido para iniciá-los:

```powershell
docker compose up -d
.\scripts\set-api-mode.ps1 -Mode docker
```

> “Antes da demonstração, iniciamos o ambiente Docker. Agora vamos fazer o
> fluxo principal pela aplicação Web. O Docker mantém os serviços necessários
> nos bastidores enquanto utilizamos a interface no navegador.”

Confirme com `docker compose ps` que os serviços estão ativos. Prepare também
uma conta de teste com e-mail confirmado, o acesso administrativo e o painel
de Grafana em `http://localhost:3001`. Se for mostrar o Mobile na apresentação,
inicie o Expo separadamente com `npx expo start` e mantenha o app apontando para
a URL configurada em `UrbanCandy_mobile/.env`.

>Embora o projeto também tenha a interface Mobile, ela não está incluída no
>Docker Compose. Nós utilizamos o Expo para executar o aplicativo no celular ou
>emulador, permitindo testar de forma prática a interface e os recursos do
>dispositivo. Por isso, o Docker foi usado para a infraestrutura e os serviços
>Web, como frontend, backend, banco de dados e Redis.

### Compra e atualização do pedido

Na tela do cliente, escolha um produto, adicione-o ao carrinho e finalize o
pedido com uma conta de teste cujo e-mail esteja confirmado. Use pagamento em
Dinheiro, se disponível, para mostrar a criação do pedido sem iniciar uma
cobrança. O pedido começa como “Recebido”.

Depois, acesse a área de funcionário, abra o pedido e altere o status pela
interface — não diretamente no banco. Dinheiro demonstra a criação do pedido,
mas não a integração financeira com o Mercado Pago. O QR Pix ilustrativo do
ambiente de desenvolvimento também não é pagável.

### Mensagem de status e serviço de e-mail

> “Quando o funcionário atualiza o status do pedido, o sistema avisa o serviço
> de e-mail para que ele envie uma atualização ao cliente. O serviço de e-mail
> fica separado do backend principal. Se eu mostrar os logs, o ACK(confirmação do 
> processamento pelo serviço de e-mail.) indica que
> o serviço recebeu e registrou o aviso; o registro `Sent` confirma o envio.
> Antes do cadastro, o usuário pode solicitar a confirmação do e-mail; o serviço
> separado gera o código, envia por e-mail e valida o endereço antes de concluir
> essa etapa. Para pedidos e alterações de status, o sistema consulta essa
> confirmação: o e-mail confirmado é enviado; sem confirmação, o evento é
> registrado como `skipped` e não entra na fila de envio.”

O fluxo usa Redis Pub/Sub com outbox; não usa RabbitMQ. Consulte
[eventos e notificações](infraestrutura/eventos-notificacoes.md). Use dados de
teste: a mudança de status pode enviar uma mensagem real.a

### Cache: o que significam MISS e HIT

Consulte o mesmo catálogo duas vezes e observe o terminal do backend no VS Code
ou os logs do container.

> “Na primeira consulta aparece MISS: o produto ainda não estava no cache, então
> o sistema consultou o banco e guardou uma cópia temporária no Redis. Na
> segunda aparece HIT: o sistema encontrou essa cópia e conseguiu usá-la.”

Se der tempo, edite e salve um produto pela aplicação. O backend invalida as
chaves do catálogo; na consulta seguinte aparece outro MISS porque o cache
precisa ser preenchido com os dados atualizados. Isso demonstra o fluxo, não
uma medição de ganho de velocidade. Consulte o
[guia de cache Redis](infraestrutura/cache-redis.md).

## 3. Documentação no GitHub — ordem da rubrica

### 3.1 Documentação arquitetural: C4, ADRs e cenários de qualidade

> “Aqui temos os diagramas C4. Eles ajudam a visualizar quem usa o sistema e
> quais são seus principais componentes. Também temos ADRs, que registram
> decisões importantes, as alternativas consideradas e por que escolhemos uma
> solução. Os cenários de qualidade descrevem como esperamos que o sistema
> responda, por exemplo, em relação a desempenho e disponibilidade.”

Mostre os [diagramas C4 e ADRs](arquitetura/01-documentacao-arquitetural/) e os
[cenários de qualidade](arquitetura/01-documentacao-arquitetural/cenarios-de-qualidade.md).
A arquitetura principal é um monólito em camadas, com o serviço de e-mail
separado. As medidas descritas são metas, não resultados medidos.

### 3.2 Estilos arquiteturais e DDD

> “Aqui temos nosso DDD, que usamos para entender e organizar o domínio do
> negócio. Identificamos áreas como Usuários, Catálogo e Pedidos para explicar
> suas responsabilidades e relações. O Context Map mostra como essas áreas se
> relacionam, e o modelo de Pedidos apresenta os conceitos envolvidos na
> compra.”

Mostre [domínio e subdomínios](arquitetura/02-estilos-arquiteturais-e-ddd/01-dominio-e-subdominios.md),
o [Context Map](arquitetura/02-estilos-arquiteturais-e-ddd/02-bounded-contexts-e-context-map.md)
e o [modelo de Pedidos](arquitetura/02-estilos-arquiteturais-e-ddd/03-modelo-do-contexto-pedidos.md).
Esclareça que esses limites ajudam a organizar o domínio, mas não são módulos
DDD isolados já implementados. Value Objects e agregado de Pedidos são conceitos
propostos no modelo, não classes já existentes no código.

### 3.3 Integração, APIs e dados

> “Aqui está a documentação da API. O OpenAPI e o Swagger ajudam a consultar
> os principais endpoints e entender como as interfaces se comunicam com o
> backend. Também registramos a escolha do MySQL: os dados se relacionam e
> operações como criar um pedido com seus itens precisam ser consistentes.”

Mostre o [OpenAPI](../UrbanCandy_back/docs/api/openapi.yaml)/Swagger e a
[ADR do MySQL](arquitetura/03-integracao-apis-e-dados/ADR-005-escolha-banco-de-dados.md).
Não diga que houve benchmark comparativo entre bancos.

### 3.4 Qualidade, resiliência e observabilidade

> “Nesta parte mostramos como pensamos em qualidade e falhas. Documentamos
> metas e mecanismos como timeout, novas tentativas e circuit breaker.
> Prometheus coleta métricas, e Grafana apresenta essas informações em um
> painel para ajudar a acompanhar o sistema.”

Mostre [qualidade e resiliência](arquitetura/04-qualidade-resiliencia-observabilidade/cenarios-de-qualidade.md)
e [observabilidade com Prometheus e Grafana](arquitetura/04-qualidade-resiliencia-observabilidade/grafana-prometheus.md).
Ao abrir o Grafana, explique os gráficos pelo significado, não por uma leitura
profissional que o projeto ainda não possui:

- **Taxa de requisições**: quantas requisições à API chegam por segundo.
- **Latência p95**: tempo abaixo do qual ficaram 95% das respostas observadas;
  não é a média.
- **Taxa de sucesso**: porcentagem das respostas que não foram erros HTTP
  tratados pelo gráfico.
- **Latência por rota**: compara o tempo das consultas de produto e categoria.
- **Operações de dependências**: volume das integrações usadas pelo backend,
  separado por resultado.
- **Circuit breaker do ViaCEP**: `0` significa fechado e operação normal; `1`
  significa aberto por falhas repetidas.
- **Sucessos acumulados**: mostram o desempenho observado dentro da janela
  configurada; atualmente as consultas de 15 e 20 dias ficam parciais enquanto
  não houver dados durante todo esse período.

O painel atual usa uma janela de 20 dias e coleta a cada 15 segundos, mas isso
não significa que o UrbanCandy já esteve disponível por 24 horas ou que existe
um histórico completo de 20 ou 30 dias. Prometheus precisa continuar rodando
para acumular dados; lacunas aparecem quando o Docker ou o computador fica
parado. Portanto, não apresente os gráficos acumulados como SLO ou medição
comprovada de 30 dias. As metas de desempenho e disponibilidade continuam
propostas. Os testes automatizados não comprovam, por si sós, integrações reais
nem disponibilidade medida ao longo do tempo.

### 3.5 Entrega contínua

> “Nosso pipeline automatiza verificações como testes e builds. Depois, inicia
> os serviços temporariamente no runner para verificar se a aplicação sobe.
> Também documentamos como recuperar o serviço e voltar para uma versão
> anterior se houver problema.”

Mostre o [workflow, estratégia de deploy e runbook](arquitetura/05-entrega-continua/ci-cd-e-runbook.md).
O deploy do GitHub Actions é temporário e não hospeda o site depois do
workflow. A estratégia é simples; não é Blue-Green.

### 3.6 Back-end Avançado: Docker Compose e Nginx

> “Aqui está a configuração Docker utilizada durante a demonstração.”

Após o fluxo no navegador, abra o `docker-compose.yml` e execute
`docker compose ps` uma única vez para confirmar a configuração em execução.
Não é necessário explicar novamente o que já foi apresentado no início. Use
`docker compose up -d` para iniciar containers já construídos e
`docker compose up --build -d` somente após alterações que exijam reconstruir as
imagens.

### 3.7 Boas práticas e observabilidade

> “Também organizamos o backend em módulos e DTOs, com validação das entradas,
> tratamento centralizado de erros e uso de logs para acompanhar o
> funcionamento das operações. Isso ajuda a separar responsabilidades,
> facilitar testes e identificar onde ocorreu uma falha.”

Mostre brevemente no código:

- A organização em camadas em `UrbanCandy_back/src/controllers`,
  `service`, `repositories` e `models`. Abra uma rota e siga a chamada até o
  controller, o service e o repository.
- O DTO de resposta de erro em
  [`ErrorResponse.ts`](../UrbanCandy_back/src/dto/ErrorResponse.ts).
- Os middlewares em [`AuthMiddleware.ts`](../UrbanCandy_back/src/middlewares/AuthMiddleware.ts),
  [`AuthorizationMiddleware.ts`](../UrbanCandy_back/src/middlewares/AuthorizationMiddleware.ts)
  e [`ErrorHandler.ts`](../UrbanCandy_back/src/middlewares/ErrorHandler.ts).
  > Temos um middleware centralizado que padroniza as respostas de erro e registra 
  > os erros para ajudar a identificar o que aconteceu. Por exemplo, uma requisição > inválida recebe uma resposta apropriada; falhas inesperadas retornam erro 
  > interno.
- O logger Winston em
  [`logger.ts`](../UrbanCandy_back/src/utils/logger.ts), usado nos pontos do
  backend que o importam. Ele escreve no console e nos arquivos `error.log` e
  `combined.log`; no Docker, os arquivos ficam dentro do container, enquanto a
  saída do console pode ser vista pelo Compose.
- Os testes em [`__tests__/`](../UrbanCandy_back/__tests__/), incluindo
  carrinho, pedidos, cache, acesso administrativo, e-mail e erros. No serviço
  de e-mail, mostre [`__tests__/`](../UrbanCandy_email/__tests__/).

Para ver os logs durante a demonstração, abra um terminal integrado no VS Code
(menu **Terminal > Novo Terminal**) na raiz do repositório. Para acompanhar
backend e serviço de e-mail juntos em um único terminal, execute:

```powershell
docker compose logs -f --tail=30 urbancandy-backend urbancandy-email
```

Se preferir deixar os logs do e-mail em um terminal separado, abra outro
terminal integrado do VS Code, também na raiz do repositório, e execute:

```powershell
docker compose logs -f --tail=30 urbancandy-email
```

Esse comando mostra apenas a saída do serviço de e-mail. Para exibir o fluxo
completo de mudança de status, procure no backend `[pubsub] Publicado` e no
serviço de e-mail `Order event persisted` e `Acknowledged order event`. `Sent`
indica que o serviço enviou o e-mail; `skipped` indica que registrou o evento,
mas não enviou porque o endereço não foi confirmado.

## 4. Jira: fluxo de trabalho

> “O Jira é a ferramenta que usamos para organizar e acompanhar o trabalho.
> Os cards priorizados representam nosso Product Backlog. Neste exemplo,
> mostro a história de usuário, a prioridade, quem está responsável, o estado
> e os critérios de aceite que indicam quando o item está concluído.”

Mostre o quadro e uma User Story no formato “Como…, quero…, para…”, além de
prioridade, responsável, estado, critérios de aceite e links ou evidências.
Não afirme que houve Sprints ou cerimônias Scrum se isso não estiver registrado.
Se um card mencionar RabbitMQ, corrija-o: o fluxo de pedidos usa Redis Pub/Sub
com outbox. Só diga que houve repriorização se puder apontar um exemplo real
no Jira.

## Fechamento

> “Em resumo, combinamos planejamento inicial com entregas incrementais.
> Mostramos uma compra, a atualização de um pedido e os principais componentes
> e documentos do projeto. Durante a apresentação, diferenciei o que está
> implementado do que é uma proposta, uma meta ou uma entrega planejada.”
