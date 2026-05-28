# Contribuindo para UrbanCandy

Obrigado por querer contribuir! Aqui estão as diretrizes.

## Conventional Commits

Todos os commits devem seguir o padrão [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<type>[optional scope]: <description>
```

### Tipos Aceitos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças em documentação
- **style**: Formatação de código (sem lógica)
- **refactor**: Refatoração de código
- **perf**: Melhorias de performance
- **test**: Adição/atualização de testes
- **build**: Mudanças no sistema de build
- **ci**: Configuração de CI/CD
- **chore**: Outras mudanças (dependências, etc.)

### Exemplos

**✅ Válidos:**

```bash
git commit -m "feat: adicionar autenticação de usuário"
git commit -m "fix: corrigir cálculo do carrinho"
git commit -m "docs: atualizar documentação da API"
git commit -m "test: adicionar testes E2E para login"
git commit -m "refactor: simplificar fluxo de checkout"
```

**❌ Inválidos:**

```bash
git commit -m "oops bad message"
git commit -m "Updated stuff"
git commit -m "fixed things"
git commit -m "WIP"
```

## Testes e Validação - Jest

### Validação Automática

Todo o processo de validação é **automático**:

1. **Pre-Commit Hook** (ao fazer `git commit`)
   - ESLint valida código
   - Prettier valida formatação
   - Jest executa testes
   - Se tudo passar → Commit criado
   - Se falhar → Commit bloqueado

2. **Pre-Push Hook** (ao fazer `git push`)
   - Jest executa testes novamente (validação final)
   - Se passar → Push permitido
   - Se falhar → Push bloqueado

**Você não pode fazer commit nem push sem passar nas validações!**

### Executar Testes Localmente

```bash
# Executar testes uma vez
npm test

# Modo watch (re-executa ao salvar)
npm test:watch

# Com cobertura
npm test:coverage
```

### Estrutura de Testes

- Testes localizados em `__tests__/` ou ao lado do componente
- Nomes de arquivo: `*.test.jsx`
- Convenção: um arquivo de teste por componente
- Use Testing Library para testar componentes React

### Escrevendo Novos Testes

**Exemplo - Frontend (JSX):**

```jsx
import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('deve renderizar com texto correto', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('deve chamar callback ao clicar', () => {
    const onClick = jest.fn();
    render(<Button label="Click" onClick={onClick} />);
    screen.getByText('Click').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Debugar Testes Falhando

1. **Ver output completo:**

   ```bash
   npm test -- --verbose
   ```

2. **Executar teste específico:**

   ```bash
   npm test -- --testNamePattern="nome do teste"
   ```

3. **Sem cobertura (mais rápido):**
   ```bash
   npm test -- --passWithNoTests
   ```

### Cobertura de Testes

```bash
npm test:coverage
# Gera relatório em coverage/
```

Acesse `coverage/lcov-report/index.html` para visualizar interativamente.

### Convenções de Testes

- **Nomes descritivos:** `should render button with correct text`
- **Arrange-Act-Assert:** Estrutura clara de preparação, ação, validação
- **Testes isolados:** Cada teste é independente
- **Sem state compartilhado:** Entre testes

### Pulando Hooks (Usar com Cuidado ⚠️)

Embora **não recomendado**, é possível pular hooks:

```bash
# Pular pre-commit hook (não use!)
git commit --no-verify

# Pular pre-push hook (não use!)
git push --no-verify
```

**⚠️ Aviso:** Pular hooks pode resultar em código de baixa qualidade. Use apenas em emergências e sempre com conhecimento do time.

### Links Úteis

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Jest Best Practices](https://jestjs.io/docs/getting-started)

---

## Fluxo de Trabalho

1. Crie uma branch: `git checkout -b feature/minha-feature`
2. Faça commits com mensagens válidas
3. Execute testes antes de fazer commit (automático no pre-commit hook)
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request no GitHub

## Código Style - ESLint + Prettier

Usamos ESLint para validação de código e Prettier para formatação automática.

### Validar Código Localmente

```bash
npm run lint:check      # Verificar linting (sem modificar)
npm run format:check    # Verificar formatação (sem modificar)
```

### Auto-corrigir Código

```bash
npm run lint --fix      # Corrigir erros de linting automaticamente
npm run format          # Formatar código com Prettier automaticamente
```

### Erros Comuns

- **Semicolons:** Prettier adiciona automaticamente ao final de linhas
- **Aspas:** Use aspas simples (') para strings, não duplas
- **Espaçamento:** Prettier normaliza automaticamente (2 espaços de indentação)
- **console.log:** Use com moderação (warning, não bloqueia commit)
- **React imports:** Não precisa de `import React` no topo de arquivos (React 17+)
- **PropTypes:** Use com moderação (warning, preferir TypeScript)

### Regras Principais

- **Indentação:** 2 espaços (nunca tabs)
- **Line width:** Máximo 100 caracteres
- **Trailing commas:** Adicionar em arrays/objetos (es5: não adiciona em função params)
- **Espaços em objetos:** `{ key: 'value' }` (sempre com espaços)
- **Ponto e vírgula:** Sempre obrigatório ao final de statements
- **Arrow functions:** Sempre com parênteses, ex: `(x) => x + 1`

### Integração com Husky (Pre-commit Hook)

O hook `pre-commit` executa automaticamente **em sequência** para garantir qualidade:

1. `npm run lint:check` - valida código com ESLint (RÁPIDO)
2. `npm run format:check` - valida formatação com Prettier (MÉDIO)
3. `npm test -- --passWithNoTests` - executa testes com Jest (LENTO)

Se alguma validação falhar, o commit é bloqueado. Execute os comandos de auto-correção acima e tente novamente.

**Pre-Push Hook (validação final antes do push):**

O hook `pre-push` executa automaticamente:

1. `npm test -- --passWithNoTests` - valida testes antes de fazer push

Se os testes falharem, o push é bloqueado.

### Documentação Oficial

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [React Documentation](https://react.dev/)

---

Obrigado por contribuir! 🙏
