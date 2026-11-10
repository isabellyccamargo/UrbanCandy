# Ciclo de vida do UrbanCandy

O projeto adota uma abordagem **híbrida**: planejamento de escopo, riscos e
dependências combinado com desenvolvimento incremental, validação e adaptação.

## PM Canvas

O [PM Canvas do UrbanCandy](pm-canvas-urbancandy.svg) resume o objetivo,
benefícios, produto, requisitos, envolvidos, entregas, premissas, restrições,
riscos, linha do tempo e custos do projeto.

## Fases e papéis

| Fase | Atividades principais |
|---|---|
| **Iniciação** | Definir objetivo, escopo macro e envolvidos; elaborar o PM Canvas. |
| **Planejamento** | Organizar backlog, estimativas, arquitetura, dependências e riscos. |
| **Execução** | Desenvolver funcionalidades em incrementos, integrar serviços e testar. |
| **Monitoramento e controle** | Acompanhar o Kanban no Jira, critérios de aceite, progresso, bloqueios e riscos. |
| **Encerramento** | Fazer testes finais e consolidar documentação e evidências no GitHub. |

**Papéis:** Isabelly Camargo acumula as responsabilidades de gerente de
projeto, Scrum Master/facilitadora, analista e desenvolvedora.

## Backlog e versões

O Product Backlog é organizado no Jira em histórias de usuário com critérios
de aceite. As versões agrupam as entregas planejadas:

| Versão | Escopo |
|---|---|
| **v1.0.0 — MVP e base** | Interfaces Web/Mobile, modelagem de dados e arquitetura inicial. |
| **v1.1.0 — Serviços e integrações** | Cache, pagamento, mensageria/eventos e Nginx. |
| **v2.0.0 — Entrega e governança** | Notificações, observabilidade, CI, deploy manual via Docker Compose e documentação. |

As versões são agrupamentos de planejamento, não necessariamente um histórico
de releases publicadas. A CI automatiza testes e builds; a execução para
demonstração é iniciada manualmente com Docker Compose e verificada pelos
serviços em execução. Depois da validação, o workflow também inicia o Compose
no runner temporário, verifica a saúde da API e encerra os serviços. Isso
demonstra deploy no pipeline, mas não mantém a aplicação publicada após o job;
para isso seria necessário configurar uma hospedagem, que pode ser gerenciada
e não exige VM própria. A mensageria implementada usa **Redis Pub/Sub com
outbox**; RabbitMQ não faz parte da arquitetura atual.
