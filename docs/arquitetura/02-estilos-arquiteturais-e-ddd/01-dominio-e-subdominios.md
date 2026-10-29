# Domínio e subdomínios

## Domínio

O UrbanCandy é uma plataforma de comércio eletrônico de doces: apresenta o catálogo, permite realizar compras e acompanha os pedidos.

## Subdomínios candidatos

### Vendas e ciclo do pedido

- **Classificação inicial:** candidato a *core*; validar com responsáveis pelo negócio.
- **Evidência e estado:** checkout, itens, consulta, cancelamento e atualização de status implementados.

### Catálogo e ofertas

- **Classificação inicial:** suporte.
- **Evidência e estado:** produtos, categorias e ofertas implementados; não foi identificada gestão de estoque.

### Usuários e acesso

- **Classificação inicial:** suporte ou genérico.
- **Evidência e estado:** cadastro, autenticação, perfil, endereço, papéis e permissões implementados.

### Pagamento transacional

- **Classificação inicial:** suporte ao fluxo de vendas.
- **Evidência e estado:** integração Mercado Pago implementada no backend; tentativas persistidas, webhook assinado e consulta de status.

### Comunicação por e-mail

- **Classificação inicial:** capacidade técnica de apoio.
- **Evidência e estado:** serviço separado para confirmação e notificações; banco próprio e integração por HTTP/Pub/Sub.

### Consulta gerencial

- **Classificação inicial:** funcionalidade da aplicação.
- **Evidência e estado:** as interfaces consultam dados da API; não há read model independente confirmado.

A classificação de um subdomínio como *core* é uma decisão de negócio e deve ser validada com as pessoas responsáveis; não se deduz apenas do código.

## Limites da interpretação

- A organização em `controllers`, `service`, `repositories` e `models` caracteriza camadas; não comprova Bounded Contexts isolados.
- Mercado Pago é uma integração externa usada pela capacidade de pagamento; não é um serviço independente dentro do UrbanCandy.
- O serviço de e-mail é uma aplicação implantada separadamente, mas isso, por si só, não define sua classificação como Bounded Context de negócio.
- Não foram identificadas gestão de estoque, integração logística, rastreamento de entrega ou agendamento no escopo examinado.

## Evidências

[Models](../../../UrbanCandy_back/src/models/), [serviço de pedidos](../../../UrbanCandy_back/src/service/OrderService.ts), [serviço Mercado Pago](../../../UrbanCandy_back/src/service/MercadoPagoService.ts), [serviço de e-mail](../../../UrbanCandy_email/src/) e [dashboard web](../../../UrbanCandy_front/src/pages/Admin/Dashboard/Dashboard.jsx).
