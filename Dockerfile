# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar ferramentas necessárias
RUN apk add --no-cache libc6-compat curl

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Instalar ferramentas necessárias para produção
RUN apk add --no-cache curl wget netcat-openbsd

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Copiar node_modules do Prisma, tsx e dependências necessárias (incluindo CLI)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

# Script de inicialização
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Alterar ownership dos arquivos
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"] 