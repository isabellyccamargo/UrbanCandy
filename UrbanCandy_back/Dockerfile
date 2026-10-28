FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs/api/openapi.yaml ./docs/api/openapi.yaml
RUN mkdir -p /app/dist/src/config
COPY --from=builder /app/src/config/errors_messages.properties ./dist/src/config/

EXPOSE 3030

CMD ["node", "dist/Server.js"]