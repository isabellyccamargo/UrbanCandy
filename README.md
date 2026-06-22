# 🍬 UrbanCandy — E-commerce de Doces

O **UrbanCandy** (SugarBeat) é uma plataforma de e-commerce completa para a venda de doces e guloseimas. O projeto possui uma arquitetura moderna dividida entre uma API robusta no ecossistema Node.js e uma interface rica e responsiva em React. Toda a aplicação foi conteinerizada para rodar facilmente em qualquer ambiente via Docker.

---

## 🚀 Tecnologias Utilizadas

### Frontend (`UrbanCandy_front`)
* **React** com **Vite** (Garante builds ultra rápidos)
* **React Router Dom** (Gerenciamento de rotas e fluxos protegidos)
* **Lucide React** (Pacote de ícones modernos)
* **React Toastify** (Notificações visuais fluidas)
* **Playwright / Jest** (Esteira completa de testes e2e e unitários)

### Backend (`UrbanCandy_back`)
* **Node.js** com **TypeScript**
* **Arquitetura MVC/Camadas** (Controllers, DTOs, Repositories, Services e Models)
* **Nginx** (Configurado como Proxy Reverso e Servidor de arquivos estáticos)
* **Jest** (Testes automatizados integrados)

### Infraestrutura e Ferramentas
* **Docker & Docker Compose** (Ambiente isolado e padronizado)
* **Husky & Commitlint** (Padronização e validação de commits antes do push)
* **ESLint & Prettier** (Consistência na formatação do código)

---

## 📁 Estrutura do Projeto

A estrutura de pastas segue as melhores práticas de mercado para monorepos/projetos divididos:

```text
URBANCANDY/
├── UrbanCandy_back/        # API Rest em Node.js (TypeScript)
│   ├── src/
│   │   ├── controllers/    # Regras de orquestração de rotas
│   │   ├── dto/            # Data Transfer Objects (Validação de dados)
│   │   ├── models/         # Definição e estruturas de dados
│   │   ├── repositories/   # Comunicação direta com a persistência
│   │   └── service/        # Regras de negócio da aplicação
│   └── uploads/            # Armazenamento de imagens de produtos
│
├── UrbanCandy_front/       # Interface do Usuário em React
│   ├── e2e/                # Testes end-to-end (Playwright)
│   └── src/
│       ├── assets/         # Imagens estáticas e identidade (ex: logo)
│       ├── componentes/    # Componentes reutilizáveis (Header, Button...)
│       ├── hooks/          # Custom Hooks (AuthContext, UseCart...)
│       └── pages/          # Páginas da aplicação (Admin, Checkout, Home...)
│
├── nginx/                  # Arquivos de configuração do servidor web
└── docker-compose.yml      # Orquestração dos containers de Front, Back e Banco

🛠️ Como Rodar o Projeto
Você pode rodar a aplicação localmente utilizando o ambiente isolado do Docker (Recomendado) ou manualmente na sua máquina.

Pré-requisitos
- Git
- Docker e Docker Compose instalados

1. Clonando o Repositório
Bash
git clone [https://github.com/isabellyccamargo/UrbanCandy.git](https://github.com/isabellyccamargo/UrbanCandy.git)
cd UrbanCandy
2. Rodando com Docker (Forma Rápida)
Para subir o banco de dados, o backend e o frontend simultaneamente, basta executar:

Bash
docker-compose up -d
A aplicação estará disponível através do domínio local configurado (ex: https://urbancandy.local ou pelas portas expostas no seu compose).

💡 Nota sobre Imagens: Se fizer alterações estruturais na identidade visual (src/assets), lembre-se de limpar o cache do build do Docker rodando:
docker-compose down && docker-compose build --no-cache && docker-compose up -d

3. Rodando Localmente (Desenvolvimento)
Caso prefira rodar os serviços fora do Docker:

No Backend:

Bash
cd UrbanCandy_back
npm install
npm run dev
No Frontend:

Bash
cd UrbanCandy_front
npm install
npm run dev
🧪 Testes Automatizados
O projeto conta com uma suíte de testes robusta para garantir que nenhuma funcionalidade seja quebrada durante alterações no código.

Para rodar os testes end-to-end (E2E) do fluxo de autenticação, carrinho, perfil e pedidos:

Bash
cd UrbanCandy_front
npm run test
# Ou usando a interface do Playwright:
npx playwright test

🤝 Contribuindo
Este projeto utiliza Husky e Commitlint. Toda vez que você for fazer um commit, o código passará por uma checagem automática de formatação e os commits devem seguir a convenção do Conventional Commits (ex: feat: adiciona componente de login ou fix: corrige rota da logo).

Desenvolvido por Isabelly Camargo ✨