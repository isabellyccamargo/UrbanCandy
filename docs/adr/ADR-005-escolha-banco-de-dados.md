# ADR 05 — Banco de dados relacional MySQL

- **Status:** Aceito (tecnologia em uso)
- **Data:** 2026-10-16

## Contexto

O backend precisa armazenar catálogo, usuários, endereços e pedidos. O modelo observado contém relações entre essas informações: produtos pertencem a categorias, pedidos referenciam pessoas, modalidades de pagamento e entrega, e itens referenciam pedidos e produtos. No checkout, o pedido e seus itens precisam ser gravados juntos; o repositório cria ambos dentro de uma transação Sequelize e executa rollback se a gravação falhar.

A configuração de persistência examinada instancia Sequelize com o dialeto `mysql`. A conexão usa `DB_NAME`, `DB_USER`, `DB_PASSWORD` e `DB_HOST`, e o servidor sincroniza os models Sequelize na inicialização. A API usa MySQL atualmente; este ADR registra e justifica essa escolha para o estado presente do projeto, não afirma que houve uma comparação de desempenho entre bancos.

## Decisão

Manter **MySQL como banco relacional da aplicação**, acessado pelo Sequelize.

## Justificativa

- O domínio atual é composto principalmente por dados estruturados e relações explícitas entre entidades.
- Chaves estrangeiras e integridade referencial são adequadas às relações entre pedidos, itens, pessoas, produtos, categorias e modalidades cadastradas.
- Transações relacionais permitem persistir pedido e itens atomicamente no fluxo de checkout observado.
- MySQL já é o dialeto configurado e utilizado pelo backend, evitando introduzir uma migração de banco sem requisito que a justifique.
- Sequelize oferece uma camada de acesso já adotada pelo projeto e mantém os models e operações transacionais usados pela aplicação.

## Alternativas consideradas

- **PostgreSQL:** também é um banco relacional tecnicamente adequado. Não foi selecionado neste ADR porque o backend está configurado para MySQL; não foi encontrada necessidade específica que justificasse trocar o banco.
- **Banco NoSQL orientado a documentos:** não foi selecionado porque as relações e a consistência transacional entre pedido e itens são centrais no fluxo observado. Não há requisito documentado que exija flexibilidade documental ou que compense abandonar o modelo relacional.

Essas alternativas não foram comparadas por benchmark; a decisão é baseada no modelo e na implementação atual.

## Consequências

- Mantém-se o banco e o código de persistência atualmente utilizados, sem migração de dados.
- O esquema precisa continuar coerente com os models Sequelize e com as relações do domínio.
- Mudanças estruturais devem ser planejadas como migrações de esquema; `sequelize.sync()` na inicialização não substitui uma estratégia de migração versionada para produção.
- A aplicação depende de um serviço MySQL disponível e de configuração correta das variáveis de conexão.
- O uso de MySQL não comprova, por si só, desempenho, alta disponibilidade, escalabilidade ou adequação a qualquer carga específica; essas qualidades precisam ser verificadas separadamente.

## Evidências no código

- Configuração do dialeto MySQL: `UrbanCandy_back/src/config/Config.ts`.
- Models e associações Sequelize: `UrbanCandy_back/src/models/`.
- Transação do checkout e gravação de pedido/itens: `UrbanCandy_back/src/repositories/OrderRepository.ts`.
