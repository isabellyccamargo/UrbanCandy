# Análise Cynefin e abordagem de gestão do UrbanCandy

## Objetivo e escopo

Este documento analisa o contexto de desenvolvimento do UrbanCandy pelo
framework Cynefin e justifica a adoção de uma abordagem híbrida de gestão. A
classificação se refere às situações de decisão do projeto, não é um rótulo
permanente para o produto ou para a equipe. Diferentes atividades podem
pertencer a domínios distintos e a classificação deve ser revista quando o
contexto mudar.

## Características do projeto consideradas

O UrbanCandy é uma plataforma de comércio eletrônico com aplicações Web e
Mobile, um backend principal organizado em camadas e um serviço de e-mail
separado. O fluxo de negócio integra catálogo, pedidos, pagamento externo e
comunicação assíncrona. Essas partes têm dependências e riscos diferentes:

- Há decisões técnicas que podem ser analisadas com práticas conhecidas, como
  organização em camadas, persistência relacional, cache e integração com
  serviços externos.
- Há incerteza sobre necessidades e experiência do usuário, especialmente nos
  fluxos de compra, confirmação de e-mail e acompanhamento de pedidos. Essas
  decisões se beneficiam de implementação incremental, validação e ajustes com
  base no retorno obtido.
- Há atividades operacionais repetíveis, como seguir instruções documentadas
  para iniciar o ambiente e verificar a disponibilidade dos serviços.
- Pagamentos e alterações de pedidos exigem planejamento, validação e controle
  de riscos; mudanças nesses fluxos não devem ser tratadas como experimentos
  sem limites.

As evidências técnicas incluem a [ADR sobre a arquitetura do backend e o
serviço de e-mail](../arquitetura/01-documentacao-arquitetural/ADR-001-arquitetura-modular-backend.md),
os [cenários de qualidade, resiliência e observabilidade](../arquitetura/04-qualidade-resiliencia-observabilidade/cenarios-de-qualidade.md)
e os [guias de infraestrutura e integração](../infraestrutura/).

## Classificação pelo Cynefin

O contexto predominante de evolução do UrbanCandy é **Complexo**, com
atividades relevantes nos domínios **Complicado** e **Claro**. Isso não
significa que toda a plataforma seja imprevisível: significa que parte
importante das decisões de produto e da interação entre fluxos só pode ser
validada adequadamente por incrementos e observação do resultado.

| Domínio | Aplicação no UrbanCandy | Resposta adequada |
|---|---|---|
| **Complexo** | Ajustes de experiência e regras que dependem do comportamento observado nos fluxos Web/Mobile, checkout, confirmação de e-mail e notificações. A resposta ideal nem sempre é conhecida antes de experimentar e receber feedback. | Trabalhar em incrementos pequenos, explicitar hipóteses, validar com pessoas usuárias e adaptar o backlog. Usar experimentos limitados e reversíveis; proteger pagamentos e dados com critérios de segurança e validação. |
| **Complicado** | Decisões com causa e efeito compreensíveis após análise especializada, como integração com Mercado Pago, consistência da outbox, persistência e observabilidade. | Analisar alternativas, consultar especialização técnica, registrar decisões e validar com testes. |
| **Simples (Claro)** | Procedimentos estáveis e repetíveis, como iniciar serviços conforme o guia, executar verificações conhecidas e seguir convenções já estabelecidas. | Padronizar, documentar e automatizar quando apropriado; monitorar exceções. |
| **Caótico** | Não é o estado normal de desenvolvimento identificado. Poderia ocorrer diante de indisponibilidade grave, incidente de segurança ou perda de dados. | Em incidente, primeiro conter e estabilizar, depois diagnosticar e definir ações preventivas. |
| **Desordem** | Surge quando ainda não se sabe qual domínio descreve uma situação específica. | Separar a situação em partes menores, identificar riscos e incertezas e então escolher a resposta correspondente. |

O domínio **Complexo** é a classificação dominante para a gestão da evolução do
projeto; não é uma afirmação de que o sistema esteja em crise ou de que a
arquitetura seja tecnicamente inexplicável. As decisões de engenharia mais
conhecidas continuam sendo tratadas como complicadas ou claras, conforme o
caso. O domínio Simples também é chamado de Claro em versões mais recentes do
framework. Em particular, pagamentos, autenticação e dados pessoais requerem
controles explícitos, e não devem ser submetidos a experimentação irrestrita.

## Comparação das abordagens de gestão

| Abordagem | Vantagens neste projeto | Limitações neste projeto |
|---|---|---|
| **Preditiva** | Facilita definir escopo, dependências, critérios de aceite, riscos e marcos para integrações críticas e entregas documentais. Ajuda a prever atividades repetíveis e a manter rastreabilidade. | Um plano detalhado fixado no início pode ficar desatualizado quando validações de UX ou integração revelarem necessidades novas. Feedback tardio aumenta o custo de ajustes. |
| **Ágil** | Favorece entregas incrementais, feedback frequente, repriorização do backlog e aprendizado nos fluxos cuja solução não é totalmente conhecida de antemão. | Sem critérios de aceite, planejamento mínimo e controles técnicos, pode reduzir previsibilidade e deixar riscos de integração, segurança ou documentação para o fim. |
| **Híbrida** | Combina planejamento e controles para dependências, riscos e critérios de aceite com ciclos curtos de implementação, validação e adaptação. Atende tanto às tarefas previsíveis quanto às situações complexas. | Exige clareza sobre quais decisões são controladas por marcos e quais podem ser ajustadas a cada ciclo. Sem essa distinção, pode acumular cerimônias ou gerar mudanças de escopo sem controle. |

## Abordagem escolhida: híbrida

Adota-se a abordagem **híbrida** para a gestão do desenvolvimento do
UrbanCandy. O planejamento preditivo é aplicado ao que precisa de coordenação
ou controle antecipado: objetivos e critérios de aceite, dependências entre
backend, aplicações e serviços, riscos de pagamento e dados, requisitos de
infraestrutura, documentação e validação antes de uma entrega.

O trabalho é executado de forma iterativa nas funcionalidades e decisões que
precisam de feedback: dividir o escopo em entregas pequenas, priorizar o
backlog, validar os fluxos implementados, registrar problemas encontrados e
ajustar as próximas atividades. Uma mudança identificada durante a validação
pode alterar a prioridade ou o desenho do próximo incremento, sem dispensar os
critérios de aceite e os controles de risco acordados.

Na prática, a combinação recomendada é:

1. **Antes de um incremento:** registrar objetivo, escopo, dependências, riscos
   e critérios verificáveis de aceite.
2. **Durante a implementação:** entregar partes pequenas e testar os fluxos e
   integrações afetados, mantendo rastreabilidade entre tarefa e evidência.
3. **Na validação:** comparar o resultado com os critérios, coletar feedback e
   atualizar prioridades ou requisitos quando necessário.
4. **Antes de disponibilizar mudanças críticas:** executar as verificações
   pertinentes, revisar efeitos em pagamento, dados e operação e manter um
   caminho de recuperação adequado.

Essa escolha evita tanto a rigidez de tentar especificar antecipadamente cada
detalhe sujeito a descoberta quanto a falta de controle de uma execução sem
planejamento. A adequação da abordagem depende de manter o equilíbrio: mais
adaptação onde há incerteza real e mais análise, padronização e controle onde
as consequências de falha são previsíveis e relevantes.

O repositório comprova características técnicas e decisões arquiteturais, mas
não registra, por si só, a frequência de cerimônias, a duração de ciclos ou
outros indicadores de processo da equipe. Esses elementos não são apresentados
aqui como fatos medidos; a abordagem híbrida está formalizada como modelo de
gestão escolhido para orientar o projeto.

## Conclusão

O UrbanCandy é classificado predominantemente no domínio **Complexo** do
Cynefin para a gestão da evolução, pois parte das necessidades e soluções deve
ser descoberta e validada durante o desenvolvimento. Integrações e decisões
arquiteturais específicas pertencem ao domínio **Complicado**, enquanto
procedimentos estáveis pertencem ao domínio **Simples (Claro)**. A abordagem **híbrida**
é a mais adequada: combina planejamento, critérios e controles com ciclos
iterativos de implementação, feedback e adaptação.

## Referência conceitual

SNOWDEN, David J.; BOONE, Mary E. *A Leader's Framework for Decision Making*.
Harvard Business Review, v. 85, n. 11, p. 68–76, 2007.
