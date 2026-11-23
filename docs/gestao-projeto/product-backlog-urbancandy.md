# Product Backlog — UrbanCandy

O Product Backlog é a lista priorizada das funcionalidades e entregas necessárias
para alcançar o objetivo do UrbanCandy. Ele complementa o PM Canvas: o canvas
orienta o projeto de forma geral, enquanto o backlog detalha o trabalho em
incrementos verificáveis.

O backlog é usado no Jira. Cada card representa uma necessidade, tarefa ou
risco rastreável e pode conter descrição, prioridade, responsável,
classificação, critérios de aceite e evidências de conclusão.

## Itens priorizados

| Prioridade | Item do backlog | Resultado esperado |
|---|---|---|
| 1 | Configurar arquitetura, banco de dados e ambiente Docker | Web, Mobile e API executáveis em ambiente local |
| 2 | Implementar cadastro, autenticação e perfis | Usuários autenticam-se e recebem acesso conforme o perfil |
| 3 | Implementar catálogo e carrinho | Usuário consulta produtos e calcula itens do carrinho |
| 4 | Implementar pedido e acompanhamento | Cliente cria um pedido e acompanha ou cancela seu estado |
| 5 | Implementar atualização administrativa de pedidos | Funcionário altera o estado do pedido de forma controlada |
| 6 | Integrar Mercado Pago e formas de pagamento | Pagamento externo ou demonstrativo é registrado com segurança |
| 7 | Implementar cache, eventos e notificação por e-mail | Consultas e mudanças relevantes são processadas de forma resiliente |
| 8 | Automatizar testes e CI/CD | Mudanças são validadas antes da entrega temporária no runner |
| 9 | Medir qualidade e observabilidade | Logs, métricas e dashboards apoiam o monitoramento |
| 10 | Consolidar documentação e encerramento | Evidências, riscos, limitações e apresentação ficam registrados |

## Critérios de acompanhamento

Os itens podem avançar por estados, como A Fazer, Em Andamento, Em Revisão e
Concluído. Critérios de aceite devem indicar o comportamento esperado, enquanto
a evidência pode ser um teste, captura, log ou descrição da demonstração.
Sprints ou quadros não substituem o Product Backlog: eles organizam a execução
de uma parte dele em determinado período.

## Relação com a gestão híbrida

O backlog permite repriorizar e entregar funcionalidades em incrementos. Ao
mesmo tempo, PM Canvas, análise Cynefin, ciclo de vida, arquitetura e riscos
mantêm o planejamento global do projeto. Descobertas da implementação podem
alterar a prioridade ou o detalhe dos itens sem invalidar o plano principal.
