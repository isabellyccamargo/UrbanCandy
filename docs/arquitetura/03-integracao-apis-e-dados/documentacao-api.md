# API, OpenAPI e persistência

## Especificação da API

A especificação OpenAPI está em
[openapi.yaml](../../../UrbanCandy_back/docs/api/openapi.yaml). Ela descreve os
principais endpoints de saúde, autenticação, catálogo, pedidos e pagamentos,
com métodos, parâmetros, corpos e respostas. Não pretende listar todas as
rotas internas da aplicação.

O Swagger UI carrega esse arquivo para permitir a consulta e o teste das
operações. Acesse <http://localhost:3030/api-docs> no Compose ou
<http://localhost:3000/api-docs> com o backend local. Em um ambiente local
configurado com domínio e TLS, também pode ser usado
<https://urbancandy.local/api-docs>. Veja o
[guia Docker Compose](../../infraestrutura/docker-compose.md) se precisar
configurar o ambiente.

Para executar uma operação no Swagger, expanda o endpoint, selecione **Try it
out**, informe os parâmetros e selecione **Execute**.

## Autenticação

Operações privadas exigem um token JWT no cabeçalho `Authorization`, usando o
esquema `Bearer`. A OpenAPI define o esquema `bearerAuth`; use **Authorize** no
Swagger após obter o token pelo endpoint de login. Login e cadastro são
operações públicas. Não compartilhe nem registre tokens reais.

## Decisão de persistência

A decisão de manter MySQL como banco relacional, incluindo justificativa,
alternativas e consequências, está na
[ADR-005 — Escolha do banco de dados](ADR-005-escolha-banco-de-dados.md).

Para o card da tarefa, os artefatos são esta página, a
[especificação OpenAPI](../../../UrbanCandy_back/docs/api/openapi.yaml) e a
[ADR-005](ADR-005-escolha-banco-de-dados.md).
