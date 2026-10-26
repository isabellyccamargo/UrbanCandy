# Entrega contínua e recuperação

## Estado no repositório

O Docker Compose de desenvolvimento e o Nginx estão versionados. Na revisão de 2026-10-23, não foram encontrados o workflow `.github/workflows/ci-cd.yml`, `docker-compose.production.yml` nem `scripts/deploy.sh`. Portanto, **pipeline CI/CD, estratégia de deploy automatizada e rollback não podem ser considerados implementados ou verificados** com o estado atual do repositório.

## Esqueleto recomendado de CI

Criar um workflow que, em pull requests e pushes, instale dependências de forma reprodutível e execute:

1. Testes de backend, frontend e serviço de e-mail.
2. Builds/type-checks dos três projetos.
3. Validação da configuração Compose e dos arquivos de documentação/API relevantes.
4. Publicação/deploy somente após sucesso das verificações, usando secrets do ambiente, nunca credenciais versionadas.

## Estratégia de deploy a decidir

Para o Compose atual, uma estratégia simples é recriar os serviços após backup e validação, executar health checks e manter instruções de rollback da versão anterior. Isso pode causar breve indisponibilidade. Blue-green exigiria duas pilhas, roteamento de tráfego e compatibilidade entre versões do banco; não está configurado.

Antes de deploy de produção, definir domínio/TLS, armazenamento de secrets, backup e restauração de MySQL/uploads, política de migração de schema, monitoramento e responsável pela aprovação. Não executar `docker compose down -v` em ambiente com dados a preservar.

## Runbook mínimo

### Aplicação indisponível

1. Verificar estado e health checks com `docker compose ps`.
2. Consultar somente os logs necessários com `docker compose logs --tail=200 <serviço>`.
3. Conferir API, Nginx e dependências; preservar volumes.
4. Reverter a aplicação para uma versão conhecida somente após confirmar compatibilidade do banco.
5. Registrar causa, duração, impacto e recuperação.

### MySQL indisponível ou suspeita de perda de dados

1. Preservar volumes e interromper gravações se houver risco de corrupção.
2. Não remover volumes nem restaurar sobre a única cópia.
3. Validar backup em ambiente isolado e confirmar integridade antes de qualquer restauração.
4. Reativar serviços e verificar os fluxos de leitura e gravação; documentar o ponto de recuperação e possível perda de dados.

## Pendências para cumprir a rubrica

- Versionar o workflow CI/CD executável com etapas de build, test e deploy.
- Definir e documentar a estratégia de deploy/rollback realmente adotada.
- Testar o runbook de indisponibilidade e recuperação e registrar evidências.
