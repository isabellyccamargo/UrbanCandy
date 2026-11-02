# Eventos e notificações de pedidos

## Fluxo

Quando um pedido é criado, o backend registra `order.created` na mesma
transação do pedido e dos itens. Quando o status muda ou é cancelado, registra
`order.status.changed` na mesma transação da alteração. A outbox publica os
eventos nos canais Redis `urbancandy:orders:created` e
`urbancandy:orders:status-changed`; no Compose, os canais recebem o prefixo
`urbancandy:docker:`. O serviço de e-mail consome os dois tipos, persiste a
entrega no banco próprio e confirma o evento. A outbox só marca a mensagem como
confirmada após essa confirmação.

O evento de criação gera um e-mail de confirmação do pedido. Alterações de
status geram e-mails de atualização, e a notificação interna persistida no
backend continua sendo exibida quando o status chega a pronto.

As notificações de pedidos prontos são associadas ao usuário dono do pedido e
persistidas no MySQL. Nas interfaces web e mobile, o sino exibe o histórico,
contador de não lidas e ações para marcar notificações como lidas. Com a
aplicação aberta, novas notificações são consultadas a cada 10 segundos; isso
não é push do sistema operacional, então o aviso aparece enquanto a aplicação
está em uso.

## Confirmação do e-mail

O cadastro solicita um código ao serviço de e-mail antes de criar a conta; a
API só persiste o usuário após a confirmação. Para contas antigas, a confirmação
pode ser solicitada após o login. A troca de endereço também exige um código
enviado ao endereço novo e só altera `Users.email` depois da confirmação.
Ambos os checkouts são protegidos no backend: e-mails não confirmados não
conseguem criar pedidos nem iniciar o checkout do Mercado Pago. Web e mobile
apresentam o motivo e encaminham o cliente para o perfil.

O serviço mantém os códigos e o estado de confirmação no banco próprio do
ambiente (`urbancandy_email_development` no local ou
`urbancandy_email_docker` no Compose), sem misturar dados com os bancos de
pedidos. A coluna `verified_emails.user_id` aceita `NULL` para permitir a
confirmação anterior ao cadastro; após a criação, a API associa o endereço ao
usuário.

Rotas envolvidas:

- `POST /api/email-verification/pre-registration/request` solicita código antes
  do cadastro; `POST /api/email-verification/confirm` confirma o código.
- `POST /api/usuario/salvar` exige uma confirmação prévia.
- `GET /api/email-verification/status` e
  `POST /api/email-verification/request` consultam/solicitam confirmação para a
  conta autenticada.
- `POST /api/email-verification/change/request` e
  `POST /api/email-verification/change/confirm` realizam a troca segura.
- `POST /api/pedido/checkout` e `POST /api/pagamento/checkout` rejeitam o
  checkout se o endereço da conta não estiver confirmado.

As rotas autenticadas de histórico são `GET /api/notificacoes`,
`PATCH /api/notificacoes/:id_notification/lida` e
`PATCH /api/notificacoes/lidas`. A rota
`GET /api/notificacoes/stream` também está disponível para clientes que desejem
usar Server-Sent Events em vez de consultar o histórico periodicamente.

## Observar a publicação

1. Acompanhe os logs do backend (`docker compose logs --follow urbancandy-backend`
   no modo Docker).
2. Crie um pedido ou altere o status de um pedido pela aplicação.
3. Confira os registros `[pubsub] Publicado`, `[email-service] Received`,
   `Order event persisted`, `[email-service] Acknowledged` e `[email-service] Sent`.
4. Opcionalmente, inspecione o tráfego Redis:

   ```powershell
   docker compose exec urbancandy-redis redis-cli MONITOR
   ```

Pub/Sub não armazena mensagens para consumidores desconectados. A outbox do
backend mantém as mudanças pendentes e tenta publicá-las até o serviço
confirmar o recebimento; ainda assim, Pub/Sub por si só não é uma fila durável.

O serviço de e-mail confirma o evento ao backend somente depois de persistir a
entrega (pendente ou ignorada por e-mail não validado) no banco exclusivo
`urbancandy_email_*`. O estado `sent` e `sent_at` só são gravados depois de o
transporte SMTP informar sucesso. Consulte
[`servico-email.md`](./servico-email.md) para verificar os registros no banco.

## Evidência de execução no Docker

Em 02/11/2026, foram publicados diretamente no Redis Docker eventos de teste
`order.created` e `order.status.changed`, usando endereços reservados
(`example.invalid`) para validar publicação, recepção, persistência e confirmação
sem disparar e-mail real:

```text
PUBLISH urbancandy:docker:orders:created -> 1 assinante
PUBLISH urbancandy:docker:orders:status-changed -> 2 assinantes
[email-service] Received order event eventId=4f337505-d23e-4a51-994a-b5598278a0a3 type=order.created orderId=2147483647.
[email-service] Order event persisted eventId=4f337505-d23e-4a51-994a-b5598278a0a3 deliveryId=3 type=order.created status=skipped.
[email-service] Acknowledged order event eventId=4f337505-d23e-4a51-994a-b5598278a0a3.
[email-service] Received order event eventId=6926c6fb-6691-40ae-901b-383009898699 type=order.status.changed orderId=2147483646.
[email-service] Order event persisted eventId=6926c6fb-6691-40ae-901b-383009898699 deliveryId=4 type=order.status.changed status=skipped.
[email-service] Acknowledged order event eventId=6926c6fb-6691-40ae-901b-383009898699.
urbancandy_email_docker: order-created | skipped | sent_at=NULL
urbancandy_email_docker: order-status | skipped | sent_at=NULL
```

O backend também registrou o consumo do evento de status. O estado `skipped` é
esperado porque os endereços sintéticos não estavam verificados. Os dois
registros foram removidos após a validação; os identificadores acima permitem
correlacionar a evidência capturada com os logs da execução.

Também foi inserido um evento sintético diretamente na outbox do banco
`urbancandy_docker` para verificar o ciclo completo:

```text
[pubsub] Publicado urbancandy:docker:orders:created: eventId=2d6d7d58-66c9-4c06-8599-e7d7fded666c type=order.created orderId=2147483645
[email-service] Order event persisted eventId=2d6d7d58-66c9-4c06-8599-e7d7fded666c deliveryId=5 type=order.created status=skipped.
[email-service] Acknowledged order event eventId=2d6d7d58-66c9-4c06-8599-e7d7fded666c.
[outbox] Acknowledged eventId=2d6d7d58-66c9-4c06-8599-e7d7fded666c.
urbancandy_docker.order_status_outbox: acknowledged_at=2026-11-02 15:54:19
urbancandy_email_docker.email_deliveries: order-created | skipped | sent_at=NULL
```

Esse teste usou os dois bancos separados e ambos os registros sintéticos foram
removidos depois da confirmação.

## Evidência de envio SMTP no Docker

Em 02/11/2026, após validar o endereço no banco Docker, foi publicado um único
evento de atualização sintético com pedido fictício `999999` e texto
identificando-o como teste. Nenhum pedido foi criado ou alterado:

```text
eventId=086c619f-99ec-4603-9990-a81f3329467c
[email-service] Order event persisted ... deliveryId=7 type=order.status.changed status=pending.
[email-service] Acknowledged order event eventId=086c619f-99ec-4603-9990-a81f3329467c.
[email-service] Sent delivery id=7 eventId=086c619f-99ec-4603-9990-a81f3329467c kind=order-status sentAt=2026-11-02T18:20:07.783Z
urbancandy_email_docker.email_deliveries: order-status | sent | attempts=1 | sent_at=2026-11-02 18:20:07
```

O registro da entrega foi mantido no banco `urbancandy_email_docker` como
evidência. O horário `sent_at` é UTC; `sent` comprova o sucesso reportado pelo
transporte SMTP.

## Evidência da validação de e-mail

Em 02/11/2026, a aplicação da coluna `verified_emails.user_id` nullable foi
confirmada nos dois bancos exclusivos do serviço:

```text
Docker: [email-service] Updated verified_emails.user_id to support pre-registration.
Docker: verified_emails.user_id IS_NULLABLE=YES
Local:  urbancandy_email_development verified_emails.user_id allowNull=true
```

Após a reconstrução, os serviços Docker de e-mail, backend e frontend ficaram
saudáveis. Uma requisição de pré-cadastro com endereço malformado retornou HTTP
400, sem criar entrega; o banco Docker permaneceu com as três entregas SMTP
históricas e nenhuma entrega pendente.
