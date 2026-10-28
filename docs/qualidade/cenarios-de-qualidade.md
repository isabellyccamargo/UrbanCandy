# Cenários de qualidade

As metas são propostas, não resultados medidos ou garantias.

## Desempenho do catálogo

- **Cenário:** consultas Web/Mobile de listagem, destaques e categorias sob
  carga concorrente em ambiente representativo.
- **SLIs:** latência p50/p95/p99, requisições por segundo, erros e uso de
  MySQL/Redis.
- **SLO proposto:** p95 até 500 ms e menos de 1% de erros HTTP 5xx. A carga
  inicial sugerida é de até 2.000 usuários virtuais, a validar antes do teste.
- **Implementado:** Cache-Aside, TTL de 60 s e invalidação após alterações.
  Ainda não há benchmark que comprove as metas.

## Disponibilidade e resiliência

- **SLO proposto:** pelo menos 99,5% de sucesso para requisições válidas em
  30 dias. SLIs: disponibilidade, erros 5xx/timeouts e duração por rota.
- **Implementado:** health checks no Compose e `GET /api/health`; não há
  evidência de coleta contínua dos SLIs ou de cumprimento do SLO.
- **Redis:** falha de cache permite leitura pelo MySQL; falha de invalidação
  pode manter dados antigos até o TTL.
- **ViaCEP:** timeout, retry limitado e circuit breaker; indisponibilidade deve
  gerar erro, não indicar CEP inválido.
- **E-mail:** falhas de SMTP mantêm a entrega pendente para novas tentativas
  com backoff.
- **Eventos:** outbox MySQL permite republicar após falha do Redis; Pub/Sub
  isoladamente não é durável. Validar ACK e idempotência por `eventId`.
- **Mercado Pago:** resultado ambíguo não deve aprovar o pagamento sem
  confirmação; validar consulta, webhook e idempotência.

Os comportamentos de falha devem ser comprovados com testes controlados,
somente em ambiente de teste.

## Observabilidade

- **Implementado:** o Compose inclui Prometheus e Grafana. Métricas de
  requisições, latência, dependências e circuito ViaCEP alimentam o dashboard
  **UrbanCandy - API overview**. A coleta ocorre a cada 15 s, com retenção de
  até 35 dias enquanto os serviços e o volume persistente estiverem ativos.
- **Ainda não comprovado:** atendimento dos SLOs; a coleta começa quando o
  ambiente Docker está em execução e os gráficos de tráfego exigem requisições.
- **Alertas:** regras de disponibilidade, erros 5xx, latência p95 e circuito
  aberto são avaliadas pelo Prometheus; notificações externas não estão
  configuradas.
- **Cuidados:** não registrar credenciais, dados pessoais ou o corpo completo
  do checkout; avaliar logs estruturados e identificador de correlação.

## Para concluir a rubrica

Medir desempenho em ambiente documentado, aprovar as metas com a equipe,
registrar um teste controlado de resiliência e implementar métricas, painel e
alertas antes de declarar a observabilidade completa.
