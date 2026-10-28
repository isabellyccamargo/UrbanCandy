# Serviço de e-mail

O serviço de e-mail é uma aplicação separada, com banco próprio. O backend
principal chama suas rotas internas por HTTP para confirmação de endereço; as
atualizações de pedidos chegam pelo Redis Pub/Sub e são persistidas antes do
envio. Falhas SMTP ficam pendentes para novas tentativas. Confirmar o e-mail
não é necessário para entrar ou comprar; é necessário para receber atualizações
de pedidos.

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
