# ADR 01 — Backend em camadas e serviço de e-mail separado

- **Status:** Aceito — descreve a arquitetura atual
- **Data:** 2026-10-23

## Contexto

Web e Mobile compartilham a API principal Node.js/Express/TypeScript. O backend é organizado em `controllers`, `service`, `repositories` e `models`, mas os domínios compartilham processo, modelos e persistência. O envio e a confirmação de e-mail foram implementados em uma aplicação separada, com banco próprio e integração por HTTP e Redis Pub/Sub.

## Decisão

Manter o backend de negócio como **monólito em camadas** e o serviço de e-mail como aplicação separada. Catálogo, usuários, pedidos e pagamentos são capacidades do backend principal; sua organização atual não deve ser chamada de monólito modular nem de Bounded Contexts isolados sem evidência de limites e contratos no código.

## Alternativas consideradas

- **Manter o backend em camadas:** escolhido; atende às interfaces atuais com uma implantação e chamadas internas simples.
- **Formalizar um monólito modular:** possível evolução; exige limites de domínio, dependências permitidas e contratos internos explícitos.
- **Separar todos os domínios em microsserviços:** não escolhido; aumentaria a operação e a comunicação distribuída sem necessidade demonstrada.
- **Manter o serviço de e-mail separado:** escolhido porque tem responsabilidade, ciclo de trabalho e banco próprios.

## Consequências

- Web e Mobile compartilham regras e dados do backend principal.
- Uma falha ou implantação do backend principal afeta suas capacidades em conjunto.
- O serviço de e-mail pode ser implantado separadamente, mas depende do Redis, do seu MySQL e do provedor SMTP.
- Uma futura modularização deve ser tratada como evolução, não como descrição do código atual.

## Evidências

`UrbanCandy_back/Server.ts`, `UrbanCandy_back/src/{controllers,service,repositories,models}`, `UrbanCandy_email/src/Server.ts` e `docker-compose.yml`.
