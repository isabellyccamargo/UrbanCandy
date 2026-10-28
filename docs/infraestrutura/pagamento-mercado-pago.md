# Pagamento com Mercado Pago

O aplicativo oferece pagamento na entrega/retirada ou pelo Checkout Pro
hospedado do Mercado Pago. Os dados do cartão são tratados pelo provedor, não
armazenados pelo UrbanCandy. O backend mantém tentativas de pagamento separadas
dos pedidos e cria o pedido aprovado após confirmação do provedor.
Se a pessoa fechar a tela antes de concluir, pode retomar o checkout enquanto
o aplicativo consulta o resultado.

## Configuração para teste

1. Configure `MERCADOPAGO_ACCESS_TOKEN` com uma credencial de teste do vendedor
   no `.env` raiz (Docker) ou em `UrbanCandy_back/.env` (backend local).
   Mantenha o token privado. Credenciais `TEST-` usam o checkout sandbox.
2. Para confirmação automática, configure
   `MERCADOPAGO_WEBHOOK_SECRET` e `MERCADOPAGO_WEBHOOK_URL` usando os valores do
   painel do Mercado Pago. A URL pública precisa usar HTTPS e apontar para
   `/api/pagamento/webhook`.
3. Use uma conta compradora de teste e siga o fluxo no app; não use cartões
   reais em testes.

Uma credencial `APP_USR-` é de produção e pode causar cobranças reais; não a
use para testes.

Sem webhook, a tela de resultado consulta o status do pagamento enquanto
permanece aberta. O backend valida a assinatura do webhook e consulta o
Mercado Pago antes de aprovar o pedido. O checkout registra o snapshot de
produtos e valores usados; preços e total enviados pelo aplicativo não são
considerados confiáveis.

As rotas são `POST /api/pagamento/checkout`,
`GET /api/pagamento/checkout/:id` e `POST /api/pagamento/webhook`.
O fluxo requer credenciais válidas para testar a integração real no sandbox.
