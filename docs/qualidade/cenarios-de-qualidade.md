# Cenários de qualidade

Os SLOs abaixo são **metas propostas**, não resultados medidos nem garantias atuais. A aplicação agora expõe métricas e o Compose inclui coleta e painel; comprovar as metas ainda requer aprová-las e medir carga/ disponibilidade em ambiente representativo.

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

- **Estímulo:** medir requisições válidas por 30 dias e simular falhas de dependências essenciais.
- **Ambiente:** execução monitorada da aplicação; falhas de Redis, MySQL, ViaCEP e SMTP devem ser injetadas apenas em ambiente de teste.
- **Resposta esperada:** meta proposta de pelo menos 99,5% de sucesso para requisições válidas na janela; respostas de erro devem ser explícitas e não apresentar sucesso falso.
- **Medidas:** disponibilidade, taxa de 5xx/timeout, duração por rota, reinicializações e duração das falhas de dependências.
- **Estado:** o Compose executa Prometheus para coletar SLI a cada 15 s e mantém 35 dias de histórico. `GET /api/health` é apenas uma verificação de vida; disponibilidade observada deve ser calculada pelos contadores de requisições, excluindo respostas 4xx. A janela de 30 dias ainda não foi coletada e a meta não foi comprovada.

### Definição operacional dos SLI/SLO

- **SLI de latência:** p95 do histograma `urbancandy_http_request_duration_seconds` por rota. SLO proposto para leituras do catálogo: p95 menor ou igual a 500 ms.
- **SLI de sucesso/disponibilidade observada:** requisições concluídas sem 5xx divididas pelas requisições não-4xx, usando `urbancandy_http_requests_total`. Respostas 4xx são excluídas por representarem solicitações inválidas ou não autorizadas. SLO proposto: pelo menos 99,5% em uma janela móvel de 30 dias.
- **SLI de erro:** proporção de respostas 5xx entre respostas não-4xx. Meta proposta: abaixo de 1% durante teste de carga.
- **Granularidade:** Prometheus coleta a cada 15 segundos e mantém 35 dias, o suficiente para inspecionar a janela móvel de 30 dias, desde que o serviço permaneça em execução e o volume persistente seja mantido.

Os comportamentos de falha devem ser comprovados com testes controlados,
somente em ambiente de teste.

| Falha simulada                                 | Comportamento esperado / implementado                                                                              | O que validar                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Redis indisponível durante leitura de catálogo | O backend registra o erro e consulta o MySQL sem cache.                                                            | Continuidade das leituras e carga adicional no banco.                   |
| Falha ao invalidar cache                       | A falha é registrada; TTL limita a duração potencial de dados obsoletos.                                           | Dados voltam ao valor atualizado após expiração.                        |
| ViaCEP lento ou indisponível                   | Timeout, até uma nova tentativa e circuit breaker; validação indisponível retorna erro, sem declarar CEP inválido. | Limites observados, resposta HTTP e recuperação do circuito.            |
| SMTP indisponível após e-mail enfileirado      | A entrega fica pendente e o worker tenta novamente com backoff.                                                    | Persistência da entrega, número de tentativas e envio após recuperação. |
| Redis indisponível para evento de status       | O evento permanece na outbox MySQL até publicação e ACK.                                                           | Reenvio após recuperação e idempotência da entrega por `eventId`.       |
| Mercado Pago indisponível/ambíguo              | Não declarar aprovação sem confirmação; tentativa permanece registrada e pode ser consultada.                      | Idempotência, consistência do estado e tratamento de webhook/consulta.  |
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

### Parâmetros de resiliência observados no código

- **ViaCEP:** timeout de 2 s por chamada, no máximo 2 chamadas (uma nova tentativa), deadline total de 4,5 s e pequeno atraso aleatório de até 100 ms. O circuit breaker abre após 5 falhas consecutivas ou pelo menos 50% de falhas numa janela das últimas 10 chamadas; permanece aberto 30 s e permite uma chamada de prova half-open.
- **Serviço de e-mail (HTTP):** timeout de 5 s; não há retry no cliente HTTP de confirmação.
- **Mercado Pago:** timeout do SDK configurado em 10 s; não há retry automático da chamada de pagamento, evitando duplicidade. Checkout usa chave de idempotência e o estado pode ser sincronizado via webhook/consulta.
- **Entrega de e-mail SMTP:** timeout de conexão/saudação de 10 s e de socket de 30 s. O worker persiste a tentativa e agenda retry exponencial, com atraso limitado a 1 hora; uma lease de 2 minutos recupera trabalho interrompido. A política de entrega é diferente do retry síncrono de chamadas HTTP.
- **Redis:** estratégia de reconexão tenta no máximo 3 vezes, com atraso crescente até 1 s; leituras de catálogo usam fallback para MySQL.

## Observabilidade implementada e pendências

- **Métricas HTTP:** o endpoint interno `:9464/metrics` expõe contadores por método, rota normalizada e status, histograma de duração, métricas padrão do Node.js e o estado do circuit breaker ViaCEP. Escuta em porta separada, não publicada no host nem encaminhada pelo Nginx; Prometheus acessa-o pela rede privada do Compose.
- **Métricas de dependências:** são contadas operações bem-sucedidas e falhas e sua duração para ViaCEP, serviço de e-mail e Mercado Pago. Não há métricas detalhadas de consultas MySQL ou comandos Redis; o Compose fornece health checks dos serviços.
- **Coleta e visualização:** Prometheus coleta a cada 15 segundos, retém 35 dias e avalia regras de alerta. Grafana provisiona o dashboard `UrbanCandy - API overview`, incluindo um indicador intermediário de sucesso observado em 15 dias, útil para acompanhar os resultados antes da apresentação. O indicador só representa a janela completa após 15 dias de coleta contínua; antes disso, o resultado é parcial. Ele não substitui nem comprova o SLO proposto de disponibilidade, cuja janela permanece em 30 dias. Interfaces Prometheus e Grafana são publicadas apenas no loopback do host. Acesso e segredos estão descritos em `docs/infraestrutura/docker-compose.md`.
- **Alertas configurados:** indisponibilidade de coleta do backend; taxa 5xx maior que 1% por 5 minutos; p95 do catálogo acima de 500 ms por 10 minutos; circuito ViaCEP aberto por 1 minuto. As regras são avaliadas no Prometheus, mas notificações externas não estão configuradas.
- **Logs:** logs existentes registram inicialização, cache, eventos, pagamento e falhas de entrega. As requisições HTTP agora geram logs JSON no stdout com método, rota normalizada, status e duração; não registram query string, corpo, tokens ou dados pessoais.
- **Saúde:** `/api/health` indica apenas que a API responde; não é prontidão de dependências nem prova de disponibilidade do SLO.
- **Segurança operacional:** a interface Grafana é publicada apenas no loopback; usar senha forte para `GRAFANA_ADMIN_PASSWORD` e não versionar segredos.

### Acessar o dashboard e manter a coleta

1. Inicie o Docker Desktop e aguarde o mecanismo Docker indicar que está em execução.
2. Na raiz do repositório, com o `.env` configurado conforme `docs/infraestrutura/docker-compose.md`, inicie os serviços necessários:

   ```sh
   docker compose up --build -d urbancandy-backend urbancandy-prometheus urbancandy-grafana
   docker compose ps
   ```

   O Compose inicia também as dependências do backend, como MySQL e Redis. Não é necessário iniciar outro backend fora do Docker. Confirme que backend, Prometheus e Grafana estão em execução; o backend deve ficar saudável para o Prometheus coletar suas métricas.

3. Abra `http://localhost:3001`, entre com `GRAFANA_ADMIN_USER` (padrão `admin`) e a senha configurada em `GRAFANA_ADMIN_PASSWORD`, e acesse **UrbanCandy - API overview**. O dashboard é provisionado pelo Compose.

O Docker Desktop aberto, sozinho, não coleta métricas: o mecanismo Docker e os containers indicados precisam permanecer em execução. Para completar a janela intermediária, mantenha esses serviços ativos por 15 dias; não é necessário abrir o site diariamente nem realizar compras. O Prometheus coleta métricas automaticamente a cada 15 segundos. Se o computador desligar ou suspender, a coleta é interrompida durante esse período.

O painel de sucesso das requisições é calculado a partir do tráfego recebido pela API. Sem requisições, essa proporção pode aparecer sem dados; não é necessário simular compras. A coleta do Prometheus ainda permite observar se o backend está sendo alcançado (`up`), mas isso não substitui um teste sintético contínuo do endpoint HTTP, que não está configurado.

## Critérios de aceitação da rubrica

1. A instrumentação, coleta, dashboard e regras de alerta estão implementadas para execução local via Compose.
2. Aprovar os SLOs propostos com a equipe; não apresentá-los como medidos antes da coleta.
3. Executar e registrar testes de carga e resiliência em ambiente representativo, incluindo hardware, configuração, duração, concorrência e percentis.
4. Configurar um receiver de notificações caso alertas por e-mail ou chat sejam necessários.
