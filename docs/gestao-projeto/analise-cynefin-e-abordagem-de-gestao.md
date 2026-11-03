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

**Classificação principal do contexto de evolução: Complexo.**

Essa é a classificação que responde ao critério da rubrica. No UrbanCandy, parte
das necessidades e regras de experiência — por exemplo, nos fluxos de compra,
confirmação de e-mail e notificações — precisa ser descoberta e validada com
incrementos e observação dos resultados. A solução ideal nem sempre pode ser
definida completamente antes de experimentar e receber feedback.

Isso não quer dizer que todos os aspectos do projeto sejam complexos. A tabela
abaixo mostra atividades que podem exigir respostas de outros domínios; elas
são contextos secundários e **não mudam a classificação principal do projeto**.

| Contexto secundário de atividade | Exemplo no UrbanCandy | Resposta adequada |
|---|---|---|
| **Complicado** | Decisões técnicas que podem ser resolvidas por análise especializada, como integração com Mercado Pago, consistência da outbox, persistência e observabilidade. | Analisar alternativas, consultar especialização técnica, registrar decisões e validar com testes. |
| **Simples (Claro)** | Procedimentos estáveis, como iniciar serviços seguindo o guia e executar verificações conhecidas. | Padronizar, documentar e automatizar quando apropriado; monitorar exceções. |
| **Caótico (contingência)** | Não é a situação normal do projeto. Poderia ocorrer em uma indisponibilidade grave, incidente de segurança ou perda de dados. | Conter e estabilizar primeiro; depois diagnosticar e definir ações preventivas. |

O domínio **Simples** também é chamado de **Claro**. **Desordem** não é uma
classificação adicional do UrbanCandy: é uma situação temporária em que ainda
não se sabe qual domínio se aplica e é preciso investigar antes de escolher a
resposta. Pagamentos, autenticação e dados pessoais requerem controles
explícitos; não devem ser tratados como experimentos sem limites.

## Comparação das abordagens de gestão

Cynefin ajuda a entender **que tipo de situação estamos enfrentando**. As
abordagens preditiva, ágil e híbrida ajudam a decidir **como organizar e
conduzir o trabalho**. Portanto, classificar o contexto como Complexo não
significa automaticamente escolher uma abordagem puramente ágil.

| Abordagem avaliada | Vantagens no UrbanCandy | Limitações no UrbanCandy | Decisão |
|---|---|---|---|
| **Preditiva** | Permite planejar escopo, dependências, critérios de aceite, riscos e marcos; é útil para integrações críticas e entregas documentais. | Um plano detalhado fixado no início pode ficar desatualizado quando validações de experiência ou integração revelarem necessidades novas; feedback tardio encarece ajustes. | **Não escolhida como abordagem única**; seus mecanismos de planejamento e controle são aproveitados no modelo híbrido. |
| **Ágil** | Favorece incrementos, feedback frequente, repriorização e aprendizado nos fluxos cuja solução ainda precisa ser validada. | Sem planejamento mínimo, critérios de aceite e controles técnicos, pode reduzir previsibilidade e deixar riscos de integração, segurança ou documentação para o fim. | **Não escolhida como abordagem única**; práticas iterativas são aproveitadas no modelo híbrido. |
| **Híbrida** | Combina planejamento e controle de dependências e riscos com ciclos curtos de implementação, validação e adaptação. Adequa-se às atividades previsíveis e às situações complexas do projeto. | Requer clareza sobre o que precisa de controle antecipado e o que pode ser ajustado a cada ciclo; sem isso, pode gerar excesso de cerimônias ou mudanças sem controle. | **Escolhida** para orientar a gestão do desenvolvimento do UrbanCandy. |

## Abordagem escolhida: híbrida

Adota-se a abordagem **híbrida** para a gestão do desenvolvimento do
UrbanCandy. O planejamento preditivo orienta o que precisa de coordenação ou
controle antecipado: objetivos e critérios de aceite, dependências entre
backend, aplicações e serviços, riscos de pagamento e dados, requisitos de
infraestrutura, documentação e validação antes de uma entrega.

As práticas ágeis orientam o trabalho que precisa de feedback: dividir o escopo
em entregas pequenas, priorizar o backlog, validar os fluxos implementados,
registrar problemas encontrados e ajustar as próximas atividades. Uma mudança
identificada durante a validação pode alterar a prioridade ou o desenho do
próximo incremento, sem dispensar os critérios de aceite e os controles de
risco acordados.

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
