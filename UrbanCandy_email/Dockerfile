FROM node:20-alpine AS production-dependencies
WORKDIR /workspace
ENV HUSKY=0
COPY package.json package-lock.json ./
COPY UrbanCandy_back/package.json ./UrbanCandy_back/package.json
COPY UrbanCandy_front/package.json ./UrbanCandy_front/package.json
COPY UrbanCandy_mobile/package.json ./UrbanCandy_mobile/package.json
COPY UrbanCandy_email/package.json ./UrbanCandy_email/package.json
RUN npm ci --omit=dev --workspace=urbancandy-email --include-workspace-root=false

FROM node:20-alpine AS builder
WORKDIR /workspace
ENV HUSKY=0
COPY package.json package-lock.json ./
COPY UrbanCandy_back/package.json ./UrbanCandy_back/package.json
COPY UrbanCandy_front/package.json ./UrbanCandy_front/package.json
COPY UrbanCandy_mobile/package.json ./UrbanCandy_mobile/package.json
COPY UrbanCandy_email/package.json ./UrbanCandy_email/package.json
RUN npm ci --workspace=urbancandy-email --include-workspace-root=false
COPY UrbanCandy_email/tsconfig.json ./UrbanCandy_email/tsconfig.json
COPY UrbanCandy_email/src ./UrbanCandy_email/src
WORKDIR /workspace/UrbanCandy_email
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=production-dependencies /workspace/node_modules ./node_modules
COPY --from=builder /workspace/UrbanCandy_email/package.json ./UrbanCandy_email/package.json
COPY --from=builder /workspace/UrbanCandy_email/dist ./UrbanCandy_email/dist
EXPOSE 3040
CMD ["node", "UrbanCandy_email/dist/Server.js"]
