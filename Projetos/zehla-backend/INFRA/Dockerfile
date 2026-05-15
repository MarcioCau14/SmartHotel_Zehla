# BUILD STAGE
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o código e compila
COPY . .
RUN npm run build

# PRODUCTION STAGE
FROM node:20-alpine

WORKDIR /app

# Copia apenas os artefatos compilados e dependências de produção
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Define o ambiente
ENV NODE_ENV=production

# O comando padrão será sobrescrito pelo docker-compose para cada worker
CMD ["npm", "run", "start"]
