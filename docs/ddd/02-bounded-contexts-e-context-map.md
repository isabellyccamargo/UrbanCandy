# Bounded Contexts e Context Map

## Situação atual

O backend principal é uma aplicação Node.js/Express/TypeScript organizada em camadas. Catálogo, usuários, pedidos e pagamentos compartilham implantação, Sequelize e modelos; o código não comprova módulos DDD isolados. Os contextos da tabela são **limites conceituais propostos** para organizar o domínio, não serviços existentes.

| Contexto candidato | Responsabilidade | Situação observada |
|---|---|---|
| **Usuários e Acesso** | Conta, perfil, endereço, autenticação e permissões. | Funcionalidades implementadas no backend compartilhado. |
| **Catálogo** | Produtos, categorias e ofertas. | Funcionalidades implementadas no backend compartilhado. |
| **Pedidos** | Checkout, itens, ciclo de status, consulta e cancelamento. | Funcionalidades implementadas no backend compartilhado. |
| **Pagamentos** | Tentativa e confirmação de pagamento. | Capacidade implementada no backend via Mercado Pago; não é serviço independente. |
| **Gestão e Indicadores** | Consultas operacionais e agregadas. | Interfaces consultam a API; não há read model dedicado confirmado. |

O serviço de e-mail é uma aplicação implantável separadamente, com banco próprio. É uma fronteira técnica real; sua classificação como Bounded Context de negócio não está estabelecida.

## Relações

| Origem → destino | Relação observada | Observação |
|---|---|---|
| Usuários e Acesso → Pedidos | Identidade e titularidade | Relação no backend compartilhado; contrato entre módulos não formalizado. |
| Catálogo → Pedidos | Referência de produto e snapshot de itens | Implementação no backend compartilhado; não implica limite modular. |
| Pedidos → Pagamentos | Criação de tentativa e resultado | Lógica no mesmo backend; Mercado Pago é provedor externo. |
| Backend → serviço de e-mail | HTTP interno para verificação; Redis Pub/Sub/outbox para eventos de status | Integração implementada entre aplicações. |
| Serviço de e-mail → MySQL/SMTP | Persistência de verificações/entregas e envio | Banco separado; SMTP é dependência externa. |

Não atribuir padrões DDD como *Customer-Supplier*, *Conformist* ou *Shared Kernel* sem contratos e responsabilidades comprovados. Relações de tabelas não bastam para demonstrá-los.

## Recomendações para o Context Map

O Context Map deve mostrar os contextos de domínio candidatos e suas relações. Apresente backend, aplicações, bancos, Redis e serviço de e-mail em uma área de arquitetura técnica separada, para não confundir containers com Bounded Contexts.

- Identifique Usuários e Acesso, Catálogo e Pedidos como **limites propostos**, não módulos já isolados.
- Mostre Pagamentos como capacidade implementada no backend e Mercado Pago como sistema externo.
- Mostre a integração do serviço de e-mail como relação técnica; não desenhe um worker de pagamento.
- Diferencie relações existentes de limites/contratos futuros com legenda explícita.

O SVG de contexto da raiz deve ser conferido com essas distinções e com os diagramas C4 enviados pela equipe antes de ser considerado final.
