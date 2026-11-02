# Serviço de e-mail

O serviço de e-mail é uma aplicação separada, com banco próprio. O backend
principal chama suas rotas internas por HTTP para solicitar e confirmar
validação de endereço. Confirmações de pedido criado e atualizações de status
chegam pelo Redis Pub/Sub e são persistidas antes do envio. Falhas SMTP ficam
pendentes para novas tentativas. Confirmar o e-mail não é necessário para entrar
ou comprar; é necessário para receber atualizações de pedidos.

Cada confirmação de pedido criado e atualização recebida é registrada em
`email_deliveries` no banco exclusivo do serviço de e-mail, incluindo o ID do
evento, o horário de origem, o tipo, o estado e, após sucesso do SMTP, a
data/hora efetiva do envio (`sent_at`). Eventos de destinatários sem e-mail
validado também ficam registrados como `skipped`, com o motivo, antes da
confirmação ao backend. Essa confirmação indica persistência no banco do
serviço, não sucesso de envio SMTP.

Na inicialização, o serviço cria tabelas ausentes e aplica de forma compatível
com dados existentes as colunas de auditoria `event_occurred_at`, `sent_at` e
`skip_reason` em `email_deliveries`. Isso vale tanto para
`urbancandy_email_development` quanto para `urbancandy_email_docker`; o banco
principal do backend não é alterado por essa migração.
Para registros antigos já marcados como `sent`, a migração preenche `sent_at`
com `updated_at`, que corresponde à gravação do sucesso pelo worker na versão
anterior. Novos envios gravam a data/hora explicitamente após o sucesso SMTP.

## Execução local

1. Crie o banco `urbancandy_email_development` no MySQL local. Não reutilize os
   bancos `urbancandy` ou `urbancandy_test`.
2. Copie `UrbanCandy_email/.env.example` para `UrbanCandy_email/.env` e
   configure a conexão com esse banco.
3. Configure a mesma `EMAIL_API_KEY` em `UrbanCandy_email/.env` e
   `UrbanCandy_back/.env`. No backend, use
   `EMAIL_SERVICE_URL=http://127.0.0.1:3040`.
4. Para envio real pelo Gmail, configure `SMTP_USER`, `SMTP_APP_PASSWORD` e
   `SMTP_FROM`. Use uma senha de app, nunca a senha normal da conta, e não
   versione credenciais.
5. Inicie o serviço e o backend em terminais separados:

   ```powershell
   npm run dev:email
   npm run dev:back
   ```

   O Redis usado pelo backend pode ser iniciado com
   `docker compose up -d urbancandy-redis`.

## Docker e testes

No Compose, o serviço usa `urbancandy-email-db`, com volume independente e
banco `urbancandy_email_docker` por padrão. O usuário e a senha são configurados
no `.env` raiz; pode-se definir `EMAIL_DB_USER`, `EMAIL_DB_PASSWORD` e
`EMAIL_DB_ROOT_PASSWORD` separadamente. O banco fica no host pela porta `3308`;
o serviço de e-mail fica na porta `3041` no host e usa `3040` entre containers.
Configure `EMAIL_API_KEY` no `.env` raiz para a comunicação entre serviços.

O banco de teste do serviço é `urbancandy_email_test`, configurado em
`UrbanCandy_email/.env.test.example`. Os testes usam transporte SMTP simulado e
não enviam mensagens reais. O serviço valida que o nome do banco corresponde
ao ambiente.

Para verificar registros no Docker, consulte somente o banco do serviço:

```sql
SELECT event_id, recipient, kind, status, event_occurred_at, sent_at, attempts, skip_reason
FROM email_deliveries
ORDER BY id DESC
LIMIT 20;
```

O banco do container fica acessível localmente pela porta `3308`; use as
credenciais `EMAIL_DB_USER` e `EMAIL_DB_PASSWORD` configuradas no `.env` raiz.
