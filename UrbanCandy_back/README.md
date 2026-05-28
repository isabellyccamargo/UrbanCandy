# UrbanCanndy_back

Backend da plataforma UrbanCandy desenvolvido com Node.js + Express + TypeScript.

## Setup Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Exemplos (ajuste conforme necessário)
DATABASE_URL=postgres://user:password@localhost:5432/urbancandy
JWT_SECRET=seu_secret_key
PORT=3000
```

### 3. Executar Testes

```bash
# Executar testes uma vez
npm test

# Modo watch (re-executa ao salvar)
npm test:watch

# Com cobertura
npm test:coverage
```

### 4. Iniciar Servidor

```bash
npm run dev
```

## Validação de Qualidade

Este projeto implementa validação automática de qualidade:

- **ESLint:** Valida estilo e boas práticas de código
- **Prettier:** Formata código automaticamente
- **Jest:** Executa testes unitários

Todos rodam automaticamente no pre-commit hook (ao fazer `git commit`).

### Validar Localmente

```bash
npm run lint:check      # Verificar ESLint sem modificar
npm run format:check    # Verificar Prettier sem modificar
npm test                # Executar testes
```

### Auto-corrigir

```bash
npm run lint --fix      # Corrigir ESLint automaticamente
npm run format          # Formatar com Prettier automaticamente
```

## Arquitetura

```
src/
├── @types/         # Tipos e interfaces TypeScript
├── config/         # Configurações e properties
├── controllers/    # Controllers (lógica de requisição)
├── dto/            # Data Transfer Objects
├── exception/      # Exceções personalizadas
├── middlewares/    # Middleware Express
├── models/         # Models Sequelize
├── repositories/   # Data access layer
├── routes/         # Rotas Express
├── service/        # Lógica de negócio
└── utils/          # Utilitários
__tests__/          # Testes unitários
```

## Commits

Este projeto segue [Conventional Commits](https://www.conventionalcommits.org/). Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes.

## Contribuindo

Por favor, leia [CONTRIBUTING.md](./CONTRIBUTING.md) antes de contribuir.

## Ambiente de Teste Isolado para E2E

Para garantir que os testes E2E não afetem dados reais, utilize um banco de dados de teste separado.

1. Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário.
2. Certifique-se de definir `DATABASE_URL_TEST` para um banco de dados exclusivo de testes (ex: `urbancandy_test`).
3. Os testes E2E e unitários devem rodar sempre usando `DATABASE_URL_TEST`.
4. Nunca rode testes E2E apontando para o banco de produção ou desenvolvimento!

### Rodando os testes E2E

```bash
npm run test:e2e
```

Os scripts de pre-push garantem que os testes E2E passem antes de permitir push para o repositório.
