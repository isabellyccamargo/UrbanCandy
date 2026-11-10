# Material de estudo — apresentação do UrbanCandy

O UrbanCandy é uma plataforma de e-commerce de doces, acessível pela Web e
por aplicativo Mobile. As duas interfaces usam a mesma API. O backend é um
monólito organizado em camadas: catálogo, usuários, pedidos e pagamentos
compartilham a aplicação, enquanto o serviço de e-mail é separado. No
[Context Map](../arquitetura/02-estilos-arquiteturais-e-ddd/ContextMap.drawio.png),
os limites de domínio ajudam a explicar responsabilidades, mas não significam
que cada área já seja um módulo independente no código.

## Arquitetura e funcionamento

A API REST aplica regras de negócio no backend e persiste os dados relacionais
no MySQL, usando Sequelize. O Swagger apresenta os endpoints. O MySQL é
adequado aos relacionamentos entre clientes, pedidos e produtos; transações
ajudam a manter consistentes as gravações relacionadas. A decisão está
registrada na [ADR-005](../arquitetura/03-integracao-apis-e-dados/ADR-005-escolha-banco-de-dados.md).

O Redis tem dois usos. No catálogo, o Cache-Aside tenta buscar primeiro no
cache; se não encontrar, consulta o MySQL e guarda uma cópia temporária. O
MySQL continua sendo a fonte de verdade. Já o Redis Pub/Sub transporta eventos
de pedidos para o serviço de e-mail. A outbox guarda eventos pendentes para
nova tentativa; o ACK confirma que o serviço persistiu a entrega, não que o
e-mail foi enviado. Para comprovar o envio, é necessário verificar também o
log `Sent`. O projeto não usa RabbitMQ para esse fluxo nem Redis para
processar pagamentos. Consulte o [guia de eventos](../infraestrutura/eventos-notificacoes.md).

Prometheus, Grafana e logs apoiam o acompanhamento do sistema. As metas de
desempenho e disponibilidade documentadas são objetivos, não resultados já
comprovados. A CI automatiza validações, testes e builds; a execução para
demonstração é iniciada manualmente com Docker Compose. Após a validação, o
Actions inicia a aplicação temporariamente no runner, confere a saúde da API
e encerra os serviços. Isso é deploy de validação no pipeline, não hospedagem
permanente; para deixar o sistema acessível depois do workflow, seria preciso
configurar um destino, que pode ser gerenciado e não exige VM própria. Os detalhes estão nos [cenários de qualidade](../arquitetura/04-qualidade-resiliencia-observabilidade/cenarios-de-qualidade.md)
e no [runbook de CI/CD](../arquitetura/05-entrega-continua/ci-cd-e-runbook.md).

## Demonstração da compra

Na tela do cliente, escolha um produto, adicione-o ao carrinho e finalize o
pedido com uma conta de teste cujo e-mail esteja confirmado. Use pagamento em
Dinheiro, se disponível, para mostrar a criação do pedido sem iniciar uma
cobrança. O backend valida os dados e calcula o total; o pedido começa como
“Recebido”.

Depois, acesse a área de funcionário, abra o pedido e altere o status pela
própria interface. Assim, além de mostrar a atualização, você aciona o fluxo
de eventos da aplicação. Não altere o status diretamente no banco. Dinheiro
não demonstra a integração financeira com o Mercado Pago, e o QR Pix
ilustrativo do ambiente de desenvolvimento não é pagável. Se os serviços de
e-mail estiverem disponíveis, mostre os logs; use dados de teste, pois a
mudança de status pode enviar uma mensagem.

## Gestão do projeto

O Cynefin ajuda a entender o contexto do projeto, não é uma metodologia de
desenvolvimento. O UrbanCandy foi classificado predominantemente como
**Complexo**: algumas soluções ficam claras apenas depois de implementar,
observar e receber feedback. Nesse contexto, é útil fazer mudanças controladas,
avaliar o resultado e ajustar os próximos passos.

A abordagem **preditiva** ajuda a planejar escopo, dependências e riscos, mas
pode ser rígida diante de descobertas. A abordagem **ágil** favorece entregas
incrementais e repriorização, mas também requer controle de riscos e
documentação. A escolha **híbrida** combina planejamento e acompanhamento
com ciclos de desenvolvimento e adaptação. Essa é a justificativa para a
gestão do projeto, detalhada na [análise Cynefin](analise-cynefin-e-abordagem-de-gestao.md).

O [PM Canvas](pm-canvas-urbancandy.svg) resume objetivo, benefícios, produto,
requisitos, pessoas envolvidas, entregas, restrições, premissas e riscos. O
ciclo de vida segue cinco fases: **iniciação**, para definir objetivo e escopo
macro; **planejamento**, para organizar backlog, arquitetura e riscos;
**execução**, para desenvolver e testar; **monitoramento e controle**, para
acompanhar progresso e bloqueios; e **encerramento**, para consolidar testes,
evidências e documentação. Isabelly Camargo acumula os papéis de gerente de
projeto, Scrum Master/facilitadora, analista e desenvolvedora.

As versões planejadas agrupam a base do MVP (v1.0.0), serviços e integrações
(v1.1.0) e entrega e governança (v2.0.0); representam organização do trabalho,
não necessariamente releases já publicadas. O [documento de ciclo de vida](ciclo-de-vida-e-pm-canvas.md)
resume o Canvas e as fases.

Em síntese, a apresentação explica como o sistema está organizado, demonstra
uma compra e a atualização de um pedido, e justifica a gestão híbrida. É
importante distinguir o que está implementado do que é planejado ou ainda
precisa de medições.
