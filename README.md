# 🍬 UrbanCandy — E-commerce de Doces

O **UrbanCandy** (SugarBeat) é uma plataforma de e-commerce desenvolvida para a venda de doces e guloseimas, oferecendo uma experiência de compra digital e ferramentas para gerenciamento de pedidos e produtos.

O projeto possui uma arquitetura dividida entre uma API desenvolvida com Node.js e interfaces web e mobile. O sistema permite que clientes realizem compras, acompanhem seus pedidos e gerenciem seus dados, enquanto funcionários e gerentes possuem recursos de gerenciamento de acordo com suas permissões.

---

## 🚀 Sobre o Projeto

O UrbanCandy foi desenvolvido com o objetivo de modernizar a experiência de compra em uma confeitaria, proporcionando praticidade aos clientes e maior organização para a gestão do negócio.

A plataforma conta com:

* 🛍️ Catálogo de produtos e categorias.
* 🛒 Carrinho de compras.
* 💳 Formas de pagamento.
* 🚚 Formas de entrega.
* 👤 Cadastro, login e gerenciamento de dados do cliente.
* 📦 Acompanhamento de pedidos.
* ❌ Cancelamento do próprio pedido, enquanto não estiver no status "Preparando".
* 🔐 Controle de acesso por funções e permissões.
* 📱 Aplicativo mobile integrado à mesma API do sistema web.
* 🖥️ Interface web responsiva.
* 🖼️ Carregamento otimizado de imagens de produtos.

---

## 🏗️ Arquitetura do Projeto

O UrbanCandy é dividido em três partes principais:

| Aplicação           | Descrição                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `UrbanCandy_front`  | Interface web desenvolvida com React e Vite.                                             |
| `UrbanCandy_mobile` | Aplicativo mobile desenvolvido com Expo, React Native e TypeScript.                      |
| `UrbanCandy_back`   | API responsável pelas regras de negócio, autenticação, pedidos e persistência dos dados. |

**Web e mobile utilizam o mesmo backend**, permitindo que os dados de clientes, produtos, pedidos e demais funcionalidades sejam compartilhados entre as plataformas.

---

## 🚀 Tecnologias Utilizadas

### Frontend Web — `UrbanCandy_front`

* **React** com **Vite** — Desenvolvimento da interface web.
* **TypeScript** — Tipagem estática.
* **React Router DOM** — Gerenciamento de rotas e fluxos protegidos.
* **Lucide React** — Ícones da interface.
* **React Toastify** — Notificações visuais.
* **Playwright / Jest** — Testes automatizados.

### Aplicativo Mobile — `UrbanCandy_mobile`

* **React Native** — Desenvolvimento mobile multiplataforma.
* **Expo** — Plataforma e ferramentas de desenvolvimento.
* **Expo Router** — Navegação baseada em arquivos.
* **TypeScript** — Tipagem estática.
* **Expo Image** — Exibição e cache de imagens.
* **AsyncStorage / Expo SecureStore** — Persistência de dados e autenticação.
* **Context API** — Gerenciamento de autenticação, carrinho e tema.
* **Axios / Fetch** — Comunicação com a API.
* **StyleSheet** — Organização dos estilos.
* **Expo Go** — Testes e execução em dispositivo físico.

### Backend — `UrbanCandy_back`

* **Node.js** com **TypeScript**.
* **Express** — Criação da API REST.
* **Sequelize** — ORM para comunicação com o banco de dados.
* **MySQL** — Banco de dados relacional.
* **JWT** — Autenticação de usuários.
* **Multer** — Upload de imagens de produtos.
* **Arquitetura em camadas** — Controllers, Services, Models e Routes.
* **RBAC** — Controle de acesso baseado em funções e permissões.

### Infraestrutura e Ferramentas

* **Docker & Docker Compose** — Conteinerização e execução do projeto.
* **Nginx** — Proxy reverso e servidor de arquivos estáticos.
* **Jest** — Testes automatizados.
* **Playwright** — Testes end-to-end.
* **ESLint & Prettier** — Padronização do código.
* **Husky & Commitlint** — Validação e padronização de commits.
* **Git & GitHub** — Versionamento e colaboração.

---

## 📁 Estrutura do Projeto

```text
URBANCANDY/
├── UrbanCandy_back/          # API REST em Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/      # Controllers das rotas
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── models/            # Models e entidades do banco
│   │   ├── repositories/      # Comunicação com a persistência
│   │   ├── routes/            # Rotas da API
│   │   ├── service/           # Regras de negócio
│   │   └── middlewares/       # Autenticação e permissões
│   └── uploads/               # Imagens de produtos
│
├── UrbanCandy_front/          # Interface web em React
│   ├── e2e/                   # Testes end-to-end
│   └── src/
│       ├── assets/             # Imagens e identidade visual
│       ├── components/        # Componentes reutilizáveis
│       ├── context/           # Contextos da aplicação
│       ├── hooks/              # Custom Hooks
│       ├── pages/              # Páginas da aplicação
│       └── services/           # Comunicação com a API
│
├── UrbanCandy_mobile/         # Aplicativo mobile em Expo + React Native
│   ├── app/                   # Rotas e telas do aplicativo
│   │   ├── protected/          # Rotas protegidas
│   │   └── ...
│   ├── assets/                # Imagens e identidade visual
│   ├── components/            # Componentes reutilizáveis
│   ├── constants/             # Constantes da aplicação
│   ├── context/               # Contextos de autenticação e carrinho
│   ├── hooks/                 # Custom Hooks
│   ├── services/              # Serviços de comunicação com a API
│   └── package.json
│
├── nginx/                     # Configurações do servidor web
└── docker-compose.yml         # Orquestração dos containers
```

---

## 🔐 Autenticação e Controle de Acesso

O UrbanCandy utiliza autenticação por token JWT e controle de acesso baseado em funções e permissões.

### Perfis de acesso

| Perfil      | Funcionalidades                                                                               |
| ----------- | --------------------------------------------------------------------------------------------- |
| Cliente     | Navegar pelos produtos, gerenciar dados, realizar pedidos e acompanhar seus próprios pedidos. |
| Funcionário | Recursos operacionais e gerenciamento de pedidos conforme suas permissões.                    |
| Gerente     | Recursos de gerenciamento e permissões administrativas conforme configurado no sistema.       |

O acesso às funcionalidades administrativas é controlado pelo backend, respeitando as permissões atribuídas a cada usuário.

---

## 📦 Funcionalidades de Pedidos

O sistema permite ao cliente:

* Visualizar seus pedidos.
* Consultar detalhes de cada pedido.
* Acompanhar o status da compra.
* Consultar informações de pagamento e entrega.
* Cancelar o próprio pedido quando permitido.

### Cancelamento de pedidos

O cancelamento é permitido somente enquanto o pedido ainda não estiver no status **"Preparando"**.

Quando o pedido já está sendo preparado, o sistema bloqueia o cancelamento para evitar alterações indevidas durante a produção.

A regra deve ser validada no backend, garantindo que o cliente não consiga burlar a restrição por meio de requisições externas.

---

## 🛒 Funcionalidades do Aplicativo Mobile

O aplicativo mobile foi desenvolvido com Expo Router e React Native, utilizando a mesma API do sistema web.

Principais recursos:

* Tela inicial e apresentação do aplicativo.
* Login e cadastro de usuários.
* Persistência de autenticação.
* Home com categorias, produtos em destaque e ofertas.
* Cardápio com navegação por categorias.
* Carrinho de compras.
* Checkout e seleção de pagamento.
* Seleção de formas de entrega.
* Tela de pedidos.
* Cancelamento de pedidos conforme o status.
* Tela de perfil e edição dos dados do cliente.
* Menu inferior de navegação.
* Interface adaptada para dispositivos móveis.
* Cache de imagens para otimizar o carregamento dos produtos.

---

## 🗄️ Banco de Dados

O backend utiliza MySQL com Sequelize para modelagem e persistência dos dados.

Entre as principais entidades estão:

* Users
* People
* Address
* Products
* Orders
* OrderItem
* Offers
* OfferProducts
* TypeOfPayment
* TypeOfDelivery
* Role
* Permission
* UserRole
* RolePermission

Os relacionamentos entre as entidades são representados por meio do DER (Diagrama Entidade-Relacionamento) do projeto.

---

## 🐳 Como Rodar o Projeto

### Pré-requisitos

* Git
* Node.js
* npm
* MySQL (caso execute sem Docker)
* Docker e Docker Compose (caso utilize containers)
* Expo Go para testar o aplicativo mobile em dispositivo físico

### 1. Clonando o repositório

```bash
git clone https://github.com/isabellyccamargo/UrbanCandy.git
cd UrbanCandy
```

### 2. Rodando com Docker

Para subir os serviços configurados no Docker Compose:

```bash
docker-compose up -d
```

A aplicação estará disponível conforme as portas e configurações definidas no arquivo `docker-compose.yml`.

### 3. Rodando o Backend

```bash
cd UrbanCandy_back
npm install
npm run dev
```

### 4. Rodando o Frontend Web

Em outro terminal:

```bash
cd UrbanCandy_front
npm install
npm run dev
```

### 5. Rodando o Aplicativo Mobile

Em outro terminal:

```bash
cd UrbanCandy_mobile
npm install
npx expo start
```

Após iniciar o Expo, escaneie o QR Code com o aplicativo Expo Go no celular.

> **Nota:** Para testar o mobile em um dispositivo físico, o celular e o computador devem estar conectados à mesma rede, conforme a configuração de desenvolvimento da API.

---

## 🧪 Testes Automatizados

O projeto possui testes automatizados para auxiliar na validação das funcionalidades.

### Testes do Frontend Web

```bash
cd UrbanCandy_front
npm run test
```

Ou utilizando o Playwright:

```bash
npx playwright test
```

### Testes do Backend

```bash
cd UrbanCandy_back
npm test
```

Os comandos devem ser executados conforme os scripts definidos nos respectivos arquivos `package.json`.

---

## 📝 Convenção de Commits

O projeto utiliza Conventional Commits para padronizar as mensagens de versionamento.

Exemplos:

```text
feat: adiciona cancelamento de pedidos no mobile
fix: corrige validação do status do pedido
feat: adiciona cache de imagens dos produtos
docs: atualiza README do projeto
```

---

## 📚 Documentação do Projeto

A documentação do UrbanCandy apresenta os principais aspectos do desenvolvimento da plataforma, incluindo sua arquitetura, requisitos, modelagem de dados e funcionalidades.

### 📄 Documentos

* 📘 **Documentação Geral do Projeto** — Apresentação do sistema, objetivos, requisitos e funcionalidades.
* 🗄️ **DER (Diagrama Entidade-Relacionamento)** — Representação da estrutura do banco de dados e seus relacionamentos.
* 📊 **Diagramas do Sistema** — Diagramas utilizados para representar os processos e a arquitetura da aplicação.
* 📱 **Documentação do Aplicativo Mobile** — Informações sobre a implementação e funcionalidades do aplicativo desenvolvido com Expo e React Native.

👉 [Acessar a documentação completa do UrbanCandy](https://docs.google.com/document/d/1yNbEy7QVzsXAts5HcmVfDUTbv5w3EJYmjcVROHTeSYg/edit?tab=t.0#heading=h.kiz4lse391rn)

---

## 👩‍💻 Desenvolvido por

**Isabelly Camargo** ✨

Projeto desenvolvido para fins acadêmicos, com foco em e-commerce de confeitaria, experiência do usuário e eficiência na gestão de pedidos.
