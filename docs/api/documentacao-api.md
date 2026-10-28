# Documentação da API

O UrbanCandy disponibiliza o Swagger UI para consultar e experimentar os
principais endpoints da API.

## Acessar o Swagger

1. Inicie o ambiente Docker com `.\scripts\start-docker.ps1` ou inicie o
   backend local com `npm run dev` dentro de `UrbanCandy_back`.
2. Abra no navegador: <https://urbancandy.local/api-docs>.

O endereço usa o domínio local do projeto. Se não abrir, confira a configuração
do domínio e do ambiente no [guia Docker Compose](../infraestrutura/docker-compose.md).

## Consultar e testar endpoints

No Swagger UI, expanda uma seção para ver os endpoints, parâmetros, exemplos e
respostas documentadas. Para experimentar uma operação:

1. Abra o endpoint e selecione **Try it out**.
2. Preencha os parâmetros ou o corpo da requisição, quando necessário.
3. Selecione **Execute** para enviar a chamada à API e consultar a resposta.

Operações protegidas exigem um token JWT. Autentique-se pelo endpoint de login
documentado e use **Authorize** para informar o token, conforme solicitado
pela interface. Não compartilhe nem registre tokens reais.

## Especificação OpenAPI

O arquivo [openapi.yaml](../../UrbanCandy_back/docs/api/openapi.yaml) contém a
especificação OpenAPI dos principais endpoints. A interface Swagger apresenta
essa documentação em formato navegável; a especificação pode ser consultada
diretamente no repositório.
