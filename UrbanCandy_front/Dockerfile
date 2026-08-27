# Stage 1: Build do Frontend (Vite)
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os mapeamentos de dependências
COPY package*.json ./

# Instala as dependências do front
RUN npm install

# Copia o restante do código do frontend
COPY . .

# Compila o Vite para produção (gera a pasta dist estática)
RUN npm run build

# Stage 2: Servir a aplicação de forma leve
FROM node:20-alpine

WORKDIR /app

# Copia as dependências e os arquivos gerados no Stage 1
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Instala um servidor estático leve globalmente para rodar o build
RUN npm install -g serve

# O Vite em produção vai rodar na porta 5173
EXPOSE 5173

# Comando para iniciar o servidor apontando para a pasta gerada
CMD ["serve", "-s", "dist", "-l", "5173"]