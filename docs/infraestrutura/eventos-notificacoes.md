# Eventos e notificações de pedidos

## Fluxo

Quando o status de um pedido muda ou é cancelado, o backend publica o evento
`order.status.changed` no Redis Pub/Sub. A mensagem inclui o identificador do
evento, data, pedido e status anterior e novo. O serviço de e-mail consome a
mudança para processar atualizações ao cliente. A outbox registra a mudança na
mesma transação do pedido e tenta publicar novamente até receber confirmação do
serviço.

As notificações de pedidos prontos são associadas ao usuário dono do pedido e
persistidas no MySQL. No aplicativo mobile, o sino exibe o histórico, contador
de não lidas e ações para marcar notificações como lidas. Com o app aberto, ele
consulta novas notificações a cada 10 segundos; isso não é push do sistema
operacional, então o aviso aparece quando o app é aberto novamente.

As rotas autenticadas de histórico são `GET /api/notificacoes`,
`PATCH /api/notificacoes/:id_notification/lida` e
`PATCH /api/notificacoes/lidas`. A rota
`GET /api/notificacoes/stream` está disponível para uma futura interface web.

## Observar a publicação

1. Acompanhe os logs do backend (`docker compose logs --follow urbancandy-backend`
   no modo Docker).
2. Altere o status de um pedido pela aplicação.
3. Confira os registros `[pubsub] Publicado`, `[pubsub] Assinante conectado` e
   `[pubsub] Consumido`.
4. Opcionalmente, inspecione o tráfego Redis:

   ```powershell
   docker compose exec urbancandy-redis redis-cli MONITOR
   ```

Pub/Sub não armazena mensagens para consumidores desconectados. A outbox do
backend mantém as mudanças pendentes e tenta publicá-las até o serviço
confirmar o recebimento; ainda assim, Pub/Sub por si só não é uma fila durável.
