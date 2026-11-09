# Cynefin e abordagem de gestão — resumo para estudo

## Conclusão

- **Cynefin:** o contexto predominante da evolução do UrbanCandy é **Complexo**.
- **Gestão escolhida:** **Híbrida**, com planejamento e controles para escopo,
  integrações e riscos, e ciclos incrementais para implementar e validar
  funcionalidades.

## Como explicar a classificação

O UrbanCandy integra catálogo, pedidos, pagamentos e notificações em
experiências Web e Mobile. Nem todas as decisões podem ser fechadas com
antecedência: alguns detalhes de uso e de integração ficam mais claros ao
implementar, testar e receber feedback. No domínio **Complexo**, a prática é
experimentar de forma controlada, observar o resultado e ajustar o próximo
passo.

Isso não quer dizer que o sistema inteiro seja imprevisível. Há atividades
mais conhecidas e repetíveis, enquanto integrações e decisões técnicas podem
exigir análise especializada. A classificação descreve o contexto
predominante, não cada tarefa individual. Em pagamentos e dados pessoais,
experimentar continua exigindo testes e controles; não significa testar sem
limites em produção.

## Comparação das abordagens

| Abordagem | Vantagem no projeto | Limitação no projeto |
|---|---|---|
| **Preditiva** | Ajuda a planejar escopo, dependências, riscos e entregas documentais. | Um plano rígido pode não acompanhar o que se aprende ao validar funcionalidades. |
| **Ágil** | Permite entregas menores, feedback e repriorização. | Sem planejamento e controles, riscos, dependências e documentação podem ficar para o fim. |
| **Híbrida — escolhida** | Combina planejamento e controle com implementação e validação incrementais. | Exige decidir o que precisa de controle formal e o que pode ser ajustado a cada ciclo. |

## Justificativa da escolha

Uma abordagem apenas preditiva seria pouco flexível para requisitos que se
esclarecem durante a validação. Uma abordagem apenas ágil não destacaria, por
si só, os controles necessários para integrações, pagamentos, segurança e
entrega. A abordagem híbrida permite planejar esses aspectos e, ao mesmo
tempo, adaptar as prioridades conforme os resultados.

Na prática: **planejar um incremento → desenvolver e testar → validar →
ajustar o próximo incremento**, sem abandonar os critérios de aceite e os
controles de risco.

## Resposta curta para apresentação

> “Classificamos o contexto predominante do UrbanCandy como Complexo no
> Cynefin porque algumas necessidades e soluções só ficam claras depois de
> implementar, testar e observar o resultado. Por isso escolhemos uma gestão
> Híbrida: planejamento e controle para escopo, riscos e integrações, com
> entregas incrementais e feedback para evoluir as funcionalidades.”

## Base documental

O contexto técnico pode ser conferido na [ADR da arquitetura do backend e do
serviço de e-mail](../arquitetura/01-documentacao-arquitetural/ADR-001-arquitetura-modular-backend.md),
na [documentação de qualidade e observabilidade](../arquitetura/04-qualidade-resiliencia-observabilidade/cenarios-de-qualidade.md)
e nos [guias de infraestrutura](../infraestrutura/). A classificação é uma
análise do projeto, não uma medição de métricas da equipe.

**Referência conceitual:** SNOWDEN, David J.; BOONE, Mary E. *A Leader's
Framework for Decision Making*. Harvard Business Review, v. 85, n. 11,
p. 68–76, 2007.
