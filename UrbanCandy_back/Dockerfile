# Stage 1: Build da aplicação
FROM node:20-alpine AS builder

# Define a pasta de trabalho interna
WORKDIR /app

# Copia os arquivos de mapeamento de dependências
COPY package*.json ./

# Instala as dependências de desenvolvimento e produção
RUN npm install

# Copia o restante do código-fonte do backend
COPY . .

# Compila o TypeScript para JavaScript puro (gera a pasta dist)
RUN npm run build

# Stage 2: Criar a imagem final de execução
FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos necessários gerados no Stage 1
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expõe a porta interna do servidor
EXPOSE 3030

# Executa o arquivo compilado principal
CMD ["node", "dist/Server.js"]