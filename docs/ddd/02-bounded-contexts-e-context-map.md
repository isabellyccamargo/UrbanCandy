# Bounded Contexts e Context Map

## Situação atual

O backend principal é uma aplicação Node.js/Express/TypeScript organizada em camadas. Catálogo, usuários, pedidos e pagamentos compartilham implantação, Sequelize e modelos; o código não comprova módulos DDD isolados. Os contextos abaixo são **limites conceituais propostos** para organizar o domínio, não serviços existentes.

### Usuários e Acesso

- **Responsabilidade:** conta, perfil, endereço, autenticação e permissões.
- **Situação observada:** funcionalidades implementadas no backend compartilhado.

### Catálogo

- **Responsabilidade:** produtos, categorias e ofertas.
- **Situação observada:** funcionalidades implementadas no backend compartilhado.

### Pedidos

- **Responsabilidade:** checkout, itens, ciclo de status, consulta e cancelamento.
- **Situação observada:** funcionalidades implementadas no backend compartilhado.

### Pagamentos

- **Responsabilidade:** tentativa e confirmação de pagamento.
- **Situação observada:** capacidade implementada no backend via Mercado Pago; não é serviço independente.

### Gestão e Indicadores

- **Responsabilidade:** consultas operacionais e agregadas.
- **Situação observada:** interfaces consultam a API; não há read model dedicado confirmado.

O serviço de e-mail é uma aplicação implantável separadamente, com banco próprio. É uma fronteira técnica real; sua classificação como Bounded Context de negócio não está estabelecida.

## Relações

### Usuários e Acesso → Pedidos

- **Relação observada:** identidade e titularidade.
- **Observação:** relação no backend compartilhado; contrato entre módulos não formalizado.

### Catálogo → Pedidos

- **Relação observada:** referência de produto e snapshot de itens.
- **Observação:** implementação no backend compartilhado; não implica limite modular.

### Pedidos → Pagamentos

- **Relação observada:** criação de tentativa e resultado.
- **Observação:** lógica no mesmo backend; Mercado Pago é provedor externo.

### Backend → serviço de e-mail

- **Relação observada:** HTTP interno para verificação; Redis Pub/Sub/outbox para eventos de status.
- **Observação:** integração implementada entre aplicações.

### Serviço de e-mail → MySQL/SMTP

- **Relação observada:** persistência de verificações/entregas e envio.
- **Observação:** banco separado; SMTP é dependência externa.

Não atribuir padrões DDD como *Customer-Supplier*, *Conformist* ou *Shared Kernel* sem contratos e responsabilidades comprovados. Relações de tabelas não bastam para demonstrá-los.

## Recomendações para o Context Map

O Context Map deve mostrar os contextos de domínio candidatos e suas relações. Apresente backend, aplicações, bancos, Redis e serviço de e-mail em uma área de arquitetura técnica separada, para não confundir containers com Bounded Contexts.

- Identifique Usuários e Acesso, Catálogo e Pedidos como **limites propostos**, não módulos já isolados.
- Mostre Pagamentos como capacidade implementada no backend e Mercado Pago como sistema externo.
- Mostre a integração do serviço de e-mail como relação técnica; não desenhe um worker de pagamento.
- Diferencie relações existentes de limites/contratos futuros com legenda explícita.

O SVG de contexto da raiz deve ser conferido com essas distinções e com os diagramas C4 enviados pela equipe antes de ser considerado final.
