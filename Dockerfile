# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx tsoa spec 

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Instala dependências de prod
COPY package*.json ./
RUN npm install --only=production

# Copia o dist (onde está o código compilado)
COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src ./src

# Segurança
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]