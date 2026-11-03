# Análise Cynefin e abordagem de gestão do UrbanCandy

## Resposta direta

> **Classificação pelo Cynefin:** domínio **Complexo**.
>
> **Abordagem de gestão escolhida:** **Híbrida**, combinando planejamento e
> controle com entregas incrementais, validação e adaptação.

Esta análise atende ao item da rubrica em um único documento. Não é necessário
criar um aplicativo Cynefin: o framework é um modelo para analisar situações
e orientar a forma de agir.

## 1. O que está sendo analisado

O Cynefin ajuda a entender o tipo de contexto em que uma decisão acontece. Ele
não é uma metodologia de desenvolvimento e não escolhe, por si só, entre
gestão preditiva, ágil ou híbrida.

São duas decisões relacionadas, mas diferentes:

1. **Cynefin:** que tipo de situação predomina na evolução do UrbanCandy?
2. **Gestão:** qual abordagem organiza melhor o trabalho diante desse contexto?

## 2. Contexto do UrbanCandy

O UrbanCandy é uma plataforma de comércio eletrônico com aplicações Web e
Mobile, um backend principal e um serviço de e-mail separado. Seu fluxo envolve
catálogo, pedidos, pagamentos e notificações.

Há decisões cuja solução depende de observar o resultado e receber feedback,
como ajustes na experiência dos fluxos de compra, confirmação de e-mail e
acompanhamento de pedidos. Também há integrações e riscos que exigem análise
técnica, critérios de aceite e validações antes de disponibilizar mudanças.

Essa combinação de descoberta, dependências e necessidade de validação é a
base da classificação abaixo. Como evidências do contexto técnico, consulte a
[ADR sobre o backend e o serviço de e-mail](../arquitetura/01-documentacao-arquitetural/ADR-001-arquitetura-modular-backend.md),
os [cenários de qualidade e observabilidade](../arquitetura/04-qualidade-resiliencia-observabilidade/cenarios-de-qualidade.md)
e os [guias de infraestrutura e integração](../infraestrutura/).

## 3. Classificação Cynefin: Complexo

**A classificação principal da evolução do UrbanCandy é o domínio Complexo.**

No domínio Complexo, não é possível determinar antecipadamente a melhor
solução para todas as situações. É preciso fazer uma mudança pequena e
controlada, observar o resultado e então decidir o próximo passo. Para o
UrbanCandy, isso se aplica principalmente a requisitos e experiências que
precisam de validação nos fluxos de compra, confirmação de e-mail e
notificações.

Em termos simples:

**experimentar em pequena escala → observar o resultado → ajustar a próxima
entrega.**

Isso não significa que cada parte do sistema seja complexa. Integrações como
pagamentos podem exigir análise especializada; procedimentos estáveis podem
ser documentados e repetidos. Esses exemplos são contextos de atividades
específicas, não classificações adicionais do projeto. A rubrica pede a
classificação do contexto do projeto, e a classificação predominante adotada
nesta análise é **Complexo**.

Pagamentos, autenticação e dados pessoais continuam exigindo critérios de
aceite, testes e controles de risco. “Experimentar” não significa testar sem
limites em produção.

## 4. Comparação das abordagens de gestão

Esta comparação responde a uma pergunta diferente da classificação Cynefin:
como organizar o desenvolvimento do UrbanCandy?

| Abordagem | Como funciona | Vantagens para o UrbanCandy | Limitações para o UrbanCandy |
|---|---|---|---|
| **Preditiva** | Planeja previamente escopo, etapas, dependências e entregas. | Ajuda a coordenar integrações, riscos, critérios de aceite e entregas documentais. | Um plano muito rígido pode não acompanhar requisitos que só ficam claros depois da validação. |
| **Ágil** | Divide o trabalho em incrementos, coleta feedback e reprioriza com frequência. | Ajuda a aprender e ajustar os fluxos de compra, e-mail e notificações conforme os resultados. | Sem planejamento e controles suficientes, pode deixar dependências, riscos e documentação para o fim. |
| **Híbrida — escolhida** | Planeja o que exige coordenação e controle, mas executa e valida funcionalidades em incrementos. | Combina previsibilidade para integrações e riscos com adaptação onde os requisitos precisam de feedback. | Exige decidir claramente o que precisa ser controlado e o que pode ser ajustado a cada incremento. |

## 5. Por que a abordagem escolhida é híbrida

A abordagem **Híbrida** é a mais adequada porque o projeto reúne trabalho
planejável e situações que precisam de descoberta:

- **Planejamento e controle:** definir objetivos, escopo, dependências,
  critérios de aceite e riscos, especialmente para pagamentos, dados,
  integrações e disponibilização de mudanças.
- **Execução iterativa:** entregar funcionalidades em partes menores, testar
  os fluxos afetados, observar os resultados e incorporar feedback nas próximas
  prioridades.

Assim, o projeto não depende de um plano imutável definido antes de conhecer
todos os resultados, nem fica sem planejamento e controle. A abordagem híbrida
aproveita práticas preditivas e ágeis conforme a necessidade de cada atividade.

## 6. Aplicação prática no projeto

1. **Planejar o incremento:** registrar objetivo, escopo, dependências, riscos
   e critérios verificáveis de aceite.
2. **Implementar em partes pequenas:** reduzir o tamanho das mudanças e testar
   os fluxos e integrações afetados.
3. **Validar o resultado:** comparar a entrega com os critérios, observar
   problemas e considerar feedback.
4. **Adaptar o próximo passo:** atualizar prioridades ou requisitos sem
   abandonar os controles necessários para pagamentos, dados e operação.

## Conclusão

Para a rubrica, a conclusão é: **o contexto de evolução do UrbanCandy é
classificado predominantemente como Complexo pelo Cynefin, e a abordagem de
gestão escolhida é Híbrida**. A primeira conclusão descreve o tipo de contexto;
a segunda explica como o trabalho será organizado para lidar com ele.

Esta é uma análise fundamentada nas características técnicas e funcionais
documentadas do projeto. O repositório não registra a frequência real de
cerimônias, a duração de ciclos ou métricas de processo da equipe; por isso,
esses dados não são apresentados como resultados medidos.

## Referência conceitual

SNOWDEN, David J.; BOONE, Mary E. *A Leader's Framework for Decision Making*.
Harvard Business Review, v. 85, n. 11, p. 68–76, 2007.
