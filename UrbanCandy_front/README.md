# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Ambiente de Teste Isolado para E2E

Para rodar os testes E2E sem afetar dados reais, utilize variáveis de ambiente específicas para testes.

1. Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário.
2. Defina `VITE_API_URL_TEST` para apontar para a API de teste (ex: backend rodando com banco de teste).
3. Os testes E2E devem rodar sempre usando `VITE_API_URL_TEST`.
4. Nunca rode testes E2E apontando para a API de produção!

### Rodando os testes E2E

```bash
npm run test:e2e
```

Os scripts de pre-push garantem que os testes E2E passem antes de permitir push para o repositório.
