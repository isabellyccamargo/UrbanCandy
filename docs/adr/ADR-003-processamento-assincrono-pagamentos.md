# ADR 03 — Integração de pagamento com Mercado Pago

- **Status:** Aceito — integração implementada
- **Data:** 2026-10-23

## Contexto

O checkout precisa encaminhar o pagamento ao provedor, manter a tentativa identificável e não criar um pedido como pago antes de uma confirmação confiável.

## Decisão

Usar o checkout hospedado do **Mercado Pago** a partir do backend principal. O backend recalcula o carrinho, persiste uma tentativa de pagamento e cria a preferência com a tentativa como referência externa e chave de idempotência. O resultado é obtido por webhook com assinatura validada ou por consulta de status. A confirmação aprovada e a criação do pedido são persistidas em uma transação.

O fluxo de pagamento é assíncrono do ponto de vista do cliente enquanto aguarda a resposta do provedor, mas **não usa Redis Pub/Sub nem um worker de pagamento**. O Redis Pub/Sub existente trata eventos de status de pedidos destinados ao serviço de e-mail.

## Alternativas consideradas

- **Confiar no retorno visual do navegador:** rejeitado; não comprova que o provedor aprovou o pagamento.
- **Consultar o provedor e validar webhook:** escolhido, com persistência da tentativa, verificação de assinatura, referência e valor.
- **Processar pagamento em worker via Redis Pub/Sub:** não adotado; não é o fluxo implementado e Pub/Sub, isoladamente, não garante entrega durável.

## Consequências

- O checkout depende da disponibilidade do Mercado Pago para iniciar uma preferência.
- O estado pendente é persistido em `payment_attempts`; falhas e estados do provedor são registrados.
- A chave de idempotência usa o identificador da tentativa. A aprovação e a criação do pedido são protegidas por transação e bloqueio do registro.
- A configuração de produção requer credenciais e URL de webhook válidas; não se deve afirmar que o fluxo real está validado apenas por testes locais.

## Evidências

`UrbanCandy_back/src/service/MercadoPagoService.ts`, `UrbanCandy_back/src/repositories/PaymentAttemptRepository.ts`, `UrbanCandy_back/src/models/PaymentAttempt.ts` e rotas/controlador de Mercado Pago.
