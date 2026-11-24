# UrbanCandy

O **UrbanCandy** é uma plataforma de e-commerce de doces, desenvolvida como
projeto acadêmico. Oferece uma interface Web e um aplicativo Mobile conectados
à mesma API. O backend principal é um monólito organizado em camadas; o envio e
a confirmação de e-mails são tratados por um serviço separado.

## Funcionalidades

- Catálogo de produtos, categorias e ofertas.
- Cadastro, login e gerenciamento de dados do cliente.
- Carrinho, checkout, pagamentos e opções de entrega. No checkout Web local há
  um fluxo de Pix demonstrativo: o QR Code é ilustrativo e, ao confirmar, o
  pedido é registrado como aprovado para teste, sem transferência ou cobrança
  real. Esse fluxo não substitui a integração real com o Mercado Pago.
- Consulta e acompanhamento de pedidos.
- Área administrativa para gestão de produtos e pedidos, com controle de
  acesso por funções e permissões.
- Confirmação de e-mail e notificações de atualização de pedidos.

## Componentes e tecnologias

| Componente | Tecnologias e responsabilidades |
| --- | --- |
| `UrbanCandy_front` | React e Vite; interface Web responsiva. |
| `UrbanCandy_mobile` | React Native, Expo e TypeScript; aplicativo executado separadamente pelo Expo. |
| `UrbanCandy_back` | Node.js, TypeScript, Express, Sequelize e MySQL; API, autenticação JWT e regras de negócio. |
| `UrbanCandy_email` | Node.js, TypeScript, MySQL e Redis; confirmação e envio de e-mails. |
| Infraestrutura | Docker Compose, Nginx, Redis, Prometheus e Grafana. |

No ambiente Docker, o Nginx encaminha as requisições da aplicação Web e da API.
O Redis é usado para cache de produtos e comunicação de eventos de pedidos
entre o backend e o serviço de e-mail. Prometheus coleta métricas e Grafana
apresenta os dashboards. O Mobile não faz parte do Compose: ele roda pelo Expo
e consome a mesma API.

## Estrutura do repositório

```text
UrbanCandy/
├── UrbanCandy_back/       # API e regras de negócio
├── UrbanCandy_email/      # Serviço de confirmação e envio de e-mails
├── UrbanCandy_front/      # Aplicação Web
├── UrbanCandy_mobile/     # Aplicativo Expo
├── docs/                  # Guias, arquitetura e gestão do projeto
├── nginx/                 # Configuração do proxy reverso
├── observability/         # Configuração do Prometheus e Grafana
├── scripts/               # Scripts para alternar os ambientes
├── docker-compose.yml
└── README.md
```

## Como executar

### Ambiente completo com Docker

Pré-requisitos: Docker Desktop (ou Docker Engine com Compose) ativo. Na raiz,
prepare o arquivo `.env` com base em `.env.example`, preencha os valores
obrigatórios e disponibilize os certificados locais esperados pelo Nginx.
Consulte o [guia Docker Compose](docs/infraestrutura/docker-compose.md) para
detalhes de configuração.

Inicie os serviços:

```powershell
.\scripts\start-docker.ps1
```

O script constrói e inicia os serviços e valida a API e a observabilidade.
Depois, acesse:

- Aplicação Web: `https://urbancandy.local` (ou `https://localhost`, conforme
  a configuração local).
- API: `http://localhost:3030`.
- Grafana: `http://localhost:3001`.
- Prometheus: `http://localhost:9090`.

Para verificar os containers ou acompanhar os logs:

```powershell
docker compose ps
docker compose logs -f --tail=50 urbancandy-backend urbancandy-email
```

### Desenvolvimento local de Web e API

O backend local precisa de um MySQL acessível e de suas configurações em
`UrbanCandy_back/.env`. Use
[`UrbanCandy_back/.env.example`](UrbanCandy_back/.env.example) como referência
e configure as credenciais locais. Em um terminal, inicie a API:

```powershell
cd UrbanCandy_back
npm install
npm run dev
```

Em outro terminal, inicie o frontend:

```powershell
cd UrbanCandy_front
npm install
npm run dev
```

Acesse `http://localhost:5173`. O Vite encaminha as chamadas para a API local
na porta `3000`. Os passos para alternar entre execução local e Docker estão
no [guia de execução](docs/como-executar.md).

### Aplicativo Mobile

O Mobile é executado pelo Expo, fora do Docker Compose:

```powershell
cd UrbanCandy_mobile
npm install
npx expo start
```

Para acessar a API Docker por um celular físico, configure
`EXPO_PUBLIC_API_URL` no arquivo `UrbanCandy_mobile/.env` com o endereço IP do
computador na rede local. Para o emulador Android padrão, o endereço inicial é
`http://10.0.2.2:80`. Consulte o
[guia Docker Compose](docs/infraestrutura/docker-compose.md) antes de configurar
o acesso: HTTP sem TLS é indicado somente para desenvolvimento em uma rede
local confiável.

## Testes e verificações

Na raiz do repositório, após instalar as dependências com `npm install`:

```powershell
npm run test:back
npm run test:front
npm run test:email
npm run lint:check
npm run build:check
```

O workflow de CI executa testes e verificações de build e valida as imagens
Docker. Consulte [CI/CD e runbook](docs/arquitetura/05-entrega-continua/ci-cd-e-runbook.md)
para entender o pipeline e seus limites: o deploy do GitHub Actions é
temporário, para validação, e não mantém o sistema hospedado.

## Documentação

- [Índice da documentação](docs/README.md)
- [Guia para executar localmente ou com Docker](docs/como-executar.md)
- [Docker Compose](docs/infraestrutura/docker-compose.md)
- [Pagamentos e demonstração de Pix](docs/infraestrutura/pagamento-mercado-pago.md)
- [Arquitetura de software](docs/arquitetura/README.md)
- [Roteiro de apresentação](docs/roteiro-apresentacao-rubrica.md)

## Projeto acadêmico

Desenvolvido por **Isabelly Camargo** para fins acadêmicos, com foco em
comércio eletrônico, experiência do usuário e gestão de pedidos.
