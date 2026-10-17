# UrbanCandy Backend

Backend da plataforma UrbanCandy desenvolvido com Node.js, Express e TypeScript.

## Setup local

### Instalar dependências

```bash
npm install
```

### Configurar o ambiente de desenvolvimento

Copie `.env.example` para `.env` nesta pasta e configure as credenciais do MySQL
de desenvolvimento. O backend usa `DB_HOST` e `DB_PORT` para selecionar a
instância do banco.

### Iniciar o servidor

```bash
npm run dev
```

## Ambientes de banco separados

| Execução                      | Arquivo/configuração          | Banco esperado      |
| ----------------------------- | ----------------------------- | ------------------- |
| Backend local (`npm run dev`) | `UrbanCandy_back/.env`        | `urbancandy`        |
| Testes (`npm test`)           | `UrbanCandy_back/.env.test`   | `urbancandy_test`   |
| Docker Compose                | `.env` na raiz do repositório | `urbancandy_docker` |

Para os testes, copie `.env.test.example` para `.env.test`. `npm test` ativa
`NODE_ENV=test`; nesse modo a aplicação carrega `.env.test`, mesmo que o
terminal tenha outras variáveis de banco definidas. A conexão é bloqueada se
`DB_NAME` não for exatamente `urbancandy_test`.

O Compose executa o backend dentro da rede Docker, que acessa o banco pelo host
`urbancandy-db` e pela porta interna `3306`. Para conectar um backend executado
diretamente no computador ao MySQL do Compose, use `127.0.0.1` e a porta
publicada (por padrão `3307`) no `.env` local. Isso não altera a configuração de
testes.

## Testes

```bash
npm test
npm run test:watch
```

Para os testes E2E, primeiro configure `.env.test` e confirme que o MySQL
selecionado está ativo:

```bash
npm run prepare-db:test
npm run test:e2e
```

`prepare-db:test` apaga e recria as tabelas do banco `urbancandy_test` antes de
popular os dados. Não execute esse comando com outro banco.

## Validação de qualidade

```bash
npm run lint:check
npm run format:check
npm test
```

## Arquitetura

```text
src/
├── @types/         # Tipos e interfaces
├── config/         # Configuração e properties
├── controllers/    # Controllers HTTP
├── dto/            # Data Transfer Objects
├── exception/      # Exceções da aplicação
├── middlewares/    # Middlewares Express
├── models/         # Models Sequelize
├── repositories/   # Acesso a dados
├── routes/         # Rotas
├── service/        # Lógica de negócio
└── utils/          # Utilitários
__tests__/          # Testes unitários
```

## Contribuindo

Este projeto segue [Conventional Commits](https://www.conventionalcommits.org/).
Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) antes de contribuir.
