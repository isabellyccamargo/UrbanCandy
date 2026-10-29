# Cenários de qualidade

Este documento define metas de referência, resiliência e observabilidade do
UrbanCandy. As metas são propostas pelo responsável do projeto; ainda não são
resultados medidos nem garantias. Comprová-las exige testes em ambiente
representativo.

## Metas de qualidade (SLI/SLO)

- **Desempenho do catálogo:** acompanhar p50/p95/p99, volume de requisições,
  erros e recursos de MySQL/Redis. Meta proposta: p95 até 500 ms e menos de 1%
  de respostas HTTP 5xx sob carga. A carga inicial sugerida é de até 2.000
  usuários virtuais, a validar antes do teste.
- **Disponibilidade observada:** requisições sem resposta 5xx divididas pelas
  requisições não-4xx, usando `urbancandy_http_requests_total`. Meta proposta:
  pelo menos 99,5% em janela móvel de 30 dias. Respostas 4xx são excluídas.
- **Medição:** o Prometheus coleta a cada 15 s e retém até 35 dias. A janela de
  30 dias ainda não foi medida. `GET /api/health` confirma que a API responde,
  mas não comprova disponibilidade nem atendimento do SLO.
- **Cache do catálogo:** Cache-Aside com TTL de 60 s e invalidação após
  alterações; ainda não há benchmark que comprove as metas.

## Resiliência

Estratégias implementadas e parâmetros principais:

- **ViaCEP:** timeout de 2 s, até 2 chamadas (uma tentativa adicional), deadline
  total de 4,5 s e circuit breaker. O circuito abre após 5 falhas consecutivas
  ou 50% de falhas nas últimas 10 chamadas, permanece aberto por 30 s e permite
  uma chamada de prova.
- **E-mail:** timeout HTTP de 5 s, sem retry no cliente de confirmação. O worker
  SMTP persiste entregas e tenta novamente com backoff exponencial (até 1 h);
  usa timeout de conexão de 10 s, socket de 30 s e lease de 2 min.
- **Mercado Pago:** timeout de 10 s, sem retry automático para evitar cobranças
  duplicadas; usa chave de idempotência e permite sincronização por webhook ou
  consulta.
- **Redis:** reconexão com até 3 tentativas e atraso crescente até 1 s. Se o
  cache falhar, leituras do catálogo usam MySQL; eventos de status ficam na
  outbox até publicação e ACK.

### Evidências de testes automatizados

Esses testes unitários usam dependências simuladas e podem verificar
comportamentos sem aguardar histórico do Prometheus/Grafana:

- **Cache/Redis:** [CacheAside.test.ts](../../../UrbanCandy_back/__tests__/CacheAside.test.ts)
  verifica cache hit, cache miss, TTL informado ao gravar e fallback para a
  origem de dados quando leitura ou gravação no Redis falha. Não simula a
  expiração real do TTL nem a reconexão do cliente Redis.
- **ViaCEP:** [ViaCepClient.test.ts](../../../UrbanCandy_back/__tests__/ViaCepClient.test.ts)
  verifica timeout, nova tentativa após falha transitória e abertura do
  circuit breaker após falhas, incluindo a chamada de prova após 30 segundos.
- **Eventos de pedidos:** [OrderEvents.test.ts](../../../UrbanCandy_back/__tests__/OrderEvents.test.ts)
  verifica o conteúdo publicado e o tratamento de mensagem inválida.
  [orderStatusConsumer.test.ts](../../../UrbanCandy_email/__tests__/orderStatusConsumer.test.ts)
  verifica que o evento é persistido antes do ACK e que falha de persistência
  impede o ACK.
- **Pagamentos:** [MercadoPagoService.test.ts](../../../UrbanCandy_back/__tests__/MercadoPagoService.test.ts)
  verifica a assinatura HMAC do webhook; [PaymentAttemptRepository.test.ts](../../../UrbanCandy_back/__tests__/PaymentAttemptRepository.test.ts)
  verifica a aplicação transacional do status e que uma aprovação repetida
  não cria outro pedido.

Na execução focada de 29/10/2026, passaram 5 suítes e 21 testes do backend,
além dos 4 testes do serviço de e-mail. São evidências de testes unitários;
não comprovam a integração com Redis, MySQL, SMTP ou o Mercado Pago real.

### Cenários ainda sem evidência de teste

Ainda precisam de testes próprios, em ambiente controlado, a expiração efetiva
do cache, as tentativas de reconexão do Redis, a publicação/reentrega da outbox
após recuperação do Redis, o retry/backoff do worker SMTP e os timeouts ou
respostas ambíguas do Mercado Pago. Esses testes não precisam de uma janela de
30 dias de métricas, mas não devem ser considerados concluídos até serem
executados e registrados.

## Observabilidade

- **Métricas:** endpoint interno `:9464/metrics` expõe contagem e duração de
  requisições por rota, método e status, métricas padrão do Node.js, estado do
  circuito ViaCEP e sucesso/falha/duração de chamadas a ViaCEP, e-mail e Mercado
  Pago. Não há métricas detalhadas de consultas MySQL ou comandos Redis.
- **Coleta e painel:** Prometheus coleta as métricas e avalia alertas; Grafana
  consulta o Prometheus e provisiona o dashboard **UrbanCandy - API overview**.
  O Compose mantém até 35 dias de dados no volume persistente. O dashboard
  também apresenta uma janela intermediária de sucesso de 15 dias, que não
  substitui o SLO de disponibilidade de 30 dias.
- **Alertas:** backend sem coleta; taxa de 5xx acima de 1% por 5 min; p95 do
  catálogo acima de 500 ms por 10 min; e circuito ViaCEP aberto por 1 min.
  Prometheus avalia as regras, mas não há notificações externas configuradas.
- **Logs:** logs JSON de requisições no stdout incluem método, rota normalizada,
  status e duração. Não incluem query string, corpo, tokens ou dados pessoais.
- **Limitações:** a coleta depende de o Docker e os serviços permanecerem
  ativos; sem tráfego, gráficos de requisições podem não ter dados. Não há
  probe sintético contínuo do endpoint HTTP.

## Acessar o dashboard

1. Inicie o Docker Desktop e aguarde o mecanismo ficar disponível.
2. Na raiz do projeto, configure o `.env` conforme o
   [guia do Docker Compose](../../infraestrutura/docker-compose.md) e execute:

   ```powershell
   docker compose up -d urbancandy-backend urbancandy-prometheus urbancandy-grafana
   docker compose ps
   ```

   O Compose inicia também as dependências do backend. Use `--build` quando
   precisar reconstruir as imagens após mudanças no código ou Dockerfile.
3. Acesse `http://localhost:3001` e abra **UrbanCandy - API overview**. Use
   `GRAFANA_ADMIN_USER` (padrão `admin`) e `GRAFANA_ADMIN_PASSWORD`.

As interfaces ficam limitadas ao computador local. A coleta para se o Docker ou
o computador parar; os dados persistem no volume enquanto ele não for removido.
Para preencher a janela intermediária, mantenha os serviços ativos por 15 dias.

## Pendências para comprovação

- Completar e registrar os cenários de teste ainda sem evidência listados acima.
- Registrar testes de carga e resiliência em ambiente representativo, incluindo
  hardware, configuração, duração, concorrência e percentis.
- Comparar as medições com as metas propostas; não apresentar metas como
  resultados antes da coleta.
- Em projeto individual, as metas são decisões de referência do responsável;
  validá-las com equipe ou cliente somente quando houver. Adicionar o link deste
  documento ao card do Jira, se aplicável.
