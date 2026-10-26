# Atributos de qualidade — UrbanCandy

Os SLOs abaixo são **metas propostas**, não resultados medidos nem garantias atuais. Para comprovar atendimento, instrumentar a aplicação e executar testes em ambiente representativo.

## Cenário de desempenho: consulta ao catálogo

- **Estímulo:** clientes Web/Mobile realizam consultas de listagem, destaque e categoria em carga concorrente.
- **Ambiente:** backend, MySQL e Redis em ambiente de teste representativo; carga inicial proposta de até 2.000 usuários virtuais simultâneos, a validar antes da execução.
- **Resposta esperada:** catálogo responde com dados corretos, usando cache quando disponível e consultando MySQL em caso de miss ou falha do Redis.
- **Medidas e meta proposta:** p95 até 500 ms para leituras e taxa de erro 5xx abaixo de 1% durante o teste. Registrar p50/p95/p99, requisições por segundo, erros e carga de MySQL/Redis.
- **Estado:** cache-aside, TTL padrão de 60 s e invalidação após alterações existem; esta meta não foi comprovada por benchmark.

## Cenário de disponibilidade: API e dependências

- **Estímulo:** medir requisições válidas por 30 dias e simular falhas de dependências essenciais.
- **Ambiente:** execução monitorada da aplicação; falhas de Redis, MySQL, ViaCEP e SMTP devem ser injetadas apenas em ambiente de teste.
- **Resposta esperada:** meta proposta de pelo menos 99,5% de sucesso para requisições válidas na janela; respostas de erro devem ser explícitas e não apresentar sucesso falso.
- **Medidas:** disponibilidade, taxa de 5xx/timeout, duração por rota, reinicializações e duração das falhas de dependências.
- **Estado:** há health checks do Compose e `GET /api/health`, mas não há evidência de coleta contínua de SLI ou de atendimento do SLO.

## Cenário de resiliência: dependências

| Falha simulada | Comportamento esperado / implementado | O que validar |
|---|---|---|
| Redis indisponível durante leitura de catálogo | O backend registra o erro e consulta o MySQL sem cache. | Continuidade das leituras e carga adicional no banco. |
| Falha ao invalidar cache | A falha é registrada; TTL limita a duração potencial de dados obsoletos. | Dados voltam ao valor atualizado após expiração. |
| ViaCEP lento ou indisponível | Timeout, até uma nova tentativa e circuit breaker; validação indisponível retorna erro, sem declarar CEP inválido. | Limites observados, resposta HTTP e recuperação do circuito. |
| SMTP indisponível após e-mail enfileirado | A entrega fica pendente e o worker tenta novamente com backoff. | Persistência da entrega, número de tentativas e envio após recuperação. |
| Redis indisponível para evento de status | O evento permanece na outbox MySQL até publicação e ACK. | Reenvio após recuperação e idempotência da entrega por `eventId`. |
| Mercado Pago indisponível/ambíguo | Não declarar aprovação sem confirmação; tentativa permanece registrada e pode ser consultada. | Idempotência, consistência do estado e tratamento de webhook/consulta. |

Os comportamentos esperados acima derivam das implementações existentes; executar testes de falha é necessário para comprová-los em conjunto. Redis Pub/Sub isoladamente não é durável; a outbox MySQL protege os eventos de status de pedido.

## Observabilidade atual e pendências

- **Logs existentes:** mensagens de inicialização, cache, publicação/consumo de eventos, pagamento e falhas de entrega via `console.*`.
- **Métricas pendentes:** volume e latência por rota, taxa de erros, disponibilidade e métricas de dependências com histórico.
- **Painéis e alertas pendentes:** não foram encontrados painéis/alertas configurados no repositório.
- **Saúde:** `/api/health` confirma resposta da API; não equivale a uma medida de disponibilidade nem a uma verificação completa de prontidão.
- **Higiene dos logs:** não registrar tokens, senhas, dados pessoais ou corpo completo de checkout. Avaliar logs estruturados e identificador de correlação.

## Critérios de aceitação da rubrica

1. Registrar os resultados dos testes de desempenho, inclusive hardware, configuração, duração, concorrência e percentis.
2. Definir/aprovar os SLOs propostos com a equipe; não apresentá-los como medidos antes da coleta.
3. Executar ao menos um teste controlado de disponibilidade/resiliência e guardar evidências.
4. Implementar métricas, painel e alertas antes de afirmar observabilidade operacional completa.
