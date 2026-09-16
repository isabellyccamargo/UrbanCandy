# 🍬 UrbanCandy — E-commerce de Doces

O **UrbanCandy** (SugarBeat) é uma plataforma de e-commerce desenvolvida para a venda de doces e guloseimas, oferecendo uma experiência de compra digital e ferramentas para gerenciamento de pedidos e produtos.

O projeto possui uma arquitetura dividida entre uma API em Node.js e interfaces web e mobile, utilizando o mesmo backend para compartilhar dados e funcionalidades.

---

## 🚀 Sobre o Projeto

O UrbanCandy foi desenvolvido para modernizar a experiência de compra em uma confeitaria, proporcionando praticidade aos clientes e organização para a gestão do negócio.

A plataforma conta com:

* 🛍️ Catálogo de produtos e categorias.
* 🛒 Carrinho de compras e checkout.
* 💳 Formas de pagamento e entrega.
* 👤 Cadastro, login e gerenciamento de dados.
* 📦 Acompanhamento e cancelamento de pedidos.
* 🔐 Controle de acesso por funções e permissões.
* 📱 Aplicativo mobile integrado à API.
* 🖥️ Interface web responsiva.

---

## 🏗️ Arquitetura do Projeto

| Aplicação           | Descrição                                                      |
| ------------------- | -------------------------------------------------------------- |
| `UrbanCandy_front`  | Interface web em React e Vite.                                 |
| `UrbanCandy_mobile` | Aplicativo mobile em Expo, React Native e TypeScript.          |
| `UrbanCandy_back`   | API responsável pelas regras de negócio, autenticação e dados. |

**Web e mobile utilizam o mesmo backend**, permitindo o compartilhamento de clientes, produtos, pedidos e demais informações.

---

## 🚀 Tecnologias Utilizadas

### Frontend Web — `UrbanCandy_front`

* React + Vite
* TypeScript
* React Router DOM
* Lucide React
* React Toastify
* Playwright / Jest

### Aplicativo Mobile — `UrbanCandy_mobile`

* React Native
* Expo + Expo Router
* TypeScript
* Expo Image (cache de imagens)
* AsyncStorage / Expo SecureStore
* Context API
* Expo Go

### Backend — `UrbanCandy_back`

* Node.js + TypeScript
* Express
* Sequelize
* MySQL
* JWT
* Multer
* Arquitetura em camadas
* RBAC (funções e permissões)

### Ferramentas

* Docker & Docker Compose
* Nginx
* Jest / Playwright
* ESLint & Prettier
* Husky & Commitlint
* Git & GitHub

---

## 📁 Estrutura do Projeto

```text
URBANCANDY/
├── UrbanCandy_back/          # API REST
│   ├── src/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── service/
│   │   └── middlewares/
│   └── uploads/
│
├── UrbanCandy_front/         # Interface web
│   ├── e2e/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── services/
│
├── UrbanCandy_mobile/        # Aplicativo mobile
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   └── services/
│
├── nginx/
├── docker-compose.yml
└── README.md
```

---

## 🔐 Autenticação e Controle de Acesso

O UrbanCandy utiliza autenticação por JWT e controle de acesso baseado em funções e permissões.

| Perfil      | Funcionalidades                               |
| ----------- | --------------------------------------------- |
| Cliente     | Produtos, carrinho, pedidos e dados pessoais. |
| Funcionário | Gerenciamento de pedidos conforme permissões. |
| Gerente     | Recursos administrativos conforme permissões. |

O acesso às funcionalidades administrativas é controlado pelo backend.

---

## 📦 Funcionalidades de Pedidos

* Visualização dos próprios pedidos.
* Consulta de detalhes, pagamento e entrega.
* Acompanhamento do status.
* Cancelamento do próprio pedido quando permitido.

### Cancelamento de pedidos

O cliente pode cancelar o próprio pedido enquanto ele não estiver no status **"Preparando"**.

Após o início da preparação, o cancelamento não é permitido. Essa regra deve ser validada no backend para garantir a segurança da operação.

---

## 📱 Funcionalidades do Aplicativo Mobile

* Login e cadastro.
* Persistência de autenticação.
* Home com categorias, destaques e ofertas.
* Cardápio com navegação por categorias.
* Carrinho, checkout e pagamentos.
* Formas de entrega.
* Consulta e cancelamento de pedidos.
* Perfil e edição de dados.
* Menu inferior de navegação.
* Cache de imagens dos produtos.

---

## 🗄️ Banco de Dados

O backend utiliza **MySQL** com **Sequelize**.

Principais entidades:

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

Os relacionamentos estão representados no DER do projeto.

---

## 🐳 Como Rodar o Projeto

### Pré-requisitos

* Git
* Node.js e npm
* Docker e Docker Compose
* Expo Go (para testar o mobile)

### 1. Clonar o repositório

```bash
git clone https://github.com/isabellyccamargo/UrbanCandy.git
cd UrbanCandy
```

### 2. Backend

```bash
cd UrbanCandy_back
npm install
npm run dev
```

### 3. Frontend Web

Em outro terminal:

```bash
cd UrbanCandy_front
npm install
npm run dev
```

### 4. Aplicativo Mobile

Em outro terminal:

```bash
cd UrbanCandy_mobile
npm install
npx expo start
```

Após iniciar o Expo, escaneie o QR Code pelo Expo Go.

> Para testar em um dispositivo físico, o celular e o computador devem estar conectados à mesma rede, conforme a configuração da API.

### Docker

Para executar os serviços configurados no Docker Compose:

```bash
docker-compose up -d
```

---

## 🧪 Testes Automatizados

### Frontend Web

```bash
cd UrbanCandy_front
npm run test
```

### Backend

```bash
cd UrbanCandy_back
npm test
```

Os comandos dependem dos scripts configurados nos respectivos `package.json`.

---

## 📚 Documentação do Projeto

A documentação apresenta os objetivos, requisitos, arquitetura, modelagem de dados e funcionalidades do UrbanCandy.

📘 **[Acessar a documentação completa do UrbanCandy](https://docs.google.com/document/d/1yNbEy7QVzsXAts5HcmVfDUTbv5w3EJYmjcVROHTeSYg/edit?tab=t.0#heading=h.kiz4lse391rn)**

A documentação também inclui o DER e os diagramas do sistema.

---

## 👩‍💻 Desenvolvido por

**Isabelly Camargo** ✨

Projeto desenvolvido para fins acadêmicos, com foco em e-commerce de confeitaria, experiência do usuário e eficiência na gestão de pedidos.
