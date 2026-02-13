# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Instala apenas dependências de prod e copia o build do stage anterior
COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

# Segurança: Não rodar como root
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]