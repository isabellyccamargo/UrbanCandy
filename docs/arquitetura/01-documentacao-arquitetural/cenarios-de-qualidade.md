# Cenários de qualidade — desempenho e disponibilidade

Este documento atende ao item de Documentação Arquitetural da rubrica. Os
cenários registram origem, estímulo, contexto, elemento afetado, resposta
esperada e medida de resposta. Os valores são metas propostas, não resultados
medidos. Detalhes da instrumentação, limitações de medição e outras estratégias
de resiliência estão em
[Qualidade, resiliência e observabilidade](../04-qualidade-resiliencia-observabilidade/cenarios-de-qualidade.md).

## QAS-01 — Desempenho de leitura do catálogo

- **Atributo:** desempenho.
- **Origem do estímulo:** clientes Web e Mobile.
- **Estímulo:** solicitações de listagem e consulta de produtos.
- **Contexto:** operação normal, com carga inicial proposta de até 2.000
  usuários virtuais; validar e registrar a carga efetiva antes do teste.
- **Elemento afetado:** API de catálogo, Cache-Aside Redis e MySQL.
- **Resposta esperada:** responder às consultas com os dados do catálogo,
  usando o cache quando disponível e recorrendo ao MySQL quando necessário.
- **Medida de resposta:** p95 de latência de até 500 ms e menos de 1% de
  respostas HTTP 5xx durante o teste de carga. Metas ainda não comprovadas.

## QAS-02 — Disponibilidade da API

- **Atributo:** disponibilidade.
- **Origem do estímulo:** clientes Web e Mobile que enviam requisições à API.
- **Estímulo:** requisições recebidas ao longo da operação normal, incluindo
  falhas de dependências que a aplicação deve tolerar.
- **Contexto:** operação contínua, medida em janela móvel de 30 dias.
- **Elemento afetado:** API principal do UrbanCandy.
- **Resposta esperada:** atender às requisições válidas; erros de cliente 4xx
  não contam como indisponibilidade, e a falha do Redis não deve interromper
  leituras do catálogo quando o MySQL estiver disponível.
- **Medida de resposta:** pelo menos 99,5% de sucesso na janela móvel de
  30 dias, calculado pela proporção de respostas que não são 5xx entre as
  requisições que não são 4xx, conforme `urbancandy_http_requests_total`.
  É uma meta proposta, ainda não medida por uma janela completa.
