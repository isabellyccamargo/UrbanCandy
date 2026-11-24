# Pagamento com Mercado Pago

O aplicativo oferece pagamento na entrega/retirada ou pelo Checkout Pro
hospedado do Mercado Pago. Os dados do cartão são tratados pelo provedor, não
armazenados pelo UrbanCandy. O backend mantém tentativas de pagamento separadas
dos pedidos e cria o pedido aprovado após confirmação do provedor.
Se a pessoa fechar a tela antes de concluir, pode retomar o checkout enquanto
o aplicativo consulta o resultado.

## Testes locais

Os testes automatizados não chamam o Mercado Pago. O backend rejeita o uso de
credenciais quando `NODE_ENV=test`; mantenha
`MERCADOPAGO_ACCESS_TOKEN` vazio em `UrbanCandy_back/.env.test`.

No checkout web executado com Vite em desenvolvimento, a opção **Pix
(demonstração)** mostra um QR ilustrativo e um temporizador de cinco minutos.
Esse QR não é pagável e não envia requisições ao Mercado Pago. O botão de
finalização cria um pedido local registrado como uma aprovação de demonstração
(`Pix (simulação)`), sem transferência real. O backend só aceita essa rota com
`NODE_ENV=development`; ela não aparece em builds de produção nem no aplicativo
mobile. Não trate pedidos de demonstração como pagamentos ou comprovantes reais.

O fluxo **Mercado Pago** continua sendo uma integração separada. No ambiente
local, confira `MERCADOPAGO_ACCESS_TOKEN` em `UrbanCandy_back/.env` antes de
usá-lo: uma credencial `APP_USR-` é de produção e pode causar cobranças reais.
Não use credenciais de produção em testes.

## Configuração do Mercado Pago

Para testar a integração real do provedor, configure uma credencial `TEST-` do
vendedor no `.env` raiz (Docker) ou em `UrbanCandy_back/.env` (backend local).
Para confirmação automática, configure `MERCADOPAGO_WEBHOOK_SECRET` e
`MERCADOPAGO_WEBHOOK_URL` usando os valores do painel do Mercado Pago. A URL
pública precisa usar HTTPS e apontar para `/api/pagamento/webhook`. Use uma
conta compradora de teste e não use cartões reais.

Uma credencial `APP_USR-` é de produção e pode causar cobranças reais. Em
produção, configure as credenciais de produção e valide a disponibilidade dos
meios de pagamento na conta vendedora.

Sem webhook, a tela de resultado consulta o status do pagamento enquanto
permanece aberta. O backend valida a assinatura do webhook e consulta o
Mercado Pago antes de aprovar o pedido. O checkout registra o snapshot de
produtos e valores usados; preços e total enviados pelo aplicativo não são
considerados confiáveis.

As rotas são `POST /api/pagamento/checkout`,
`GET /api/pagamento/checkout/:id` e `POST /api/pagamento/webhook`.
O fluxo requer credenciais válidas para a integração real com o provedor; o Pix
demonstrativo local não substitui nem valida essa integração.
