# ⚡ Quick Start - Deploy no Portainer

## 🚀 Deploy Rápido (5 minutos)

### 1. Preparar Variáveis de Ambiente

Copie este template e cole nas variáveis de ambiente do Portainer:

```env
# Seu domínio ou IP
NEXTAUTH_URL=http://SEU_IP:3000

# Banco de dados
POSTGRES_DB=porteirob
POSTGRES_USER=postgres
POSTGRES_PASSWORD=MinhaSenh@Segura123!

# Secrets (GERE NOVOS VALORES!)
JWT_SECRET=8f2a9b4c6d8e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e
NEXTAUTH_SECRET=eW2BvZH8FXiQ5uz1MRoPb8nujHCYuKOQFNQE1A8eBslpsZ5AT8wfegWjoxNXLy+sxGacjCfxGQE6IqVjSDv4MQ==

# Configurações
APP_PORT=3000
RUN_SEED=true
NODE_ENV=production
```

### 2. Deploy no Portainer

1. **Acesse Portainer** → **Stacks** → **Add Stack**
2. **Name**: `porteiro`
3. **Build method**: **Web editor**
4. **Cole este docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: porteiro-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-porteirob}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-porteirob}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - porteiro-network

  app:
    image: node:18-alpine
    container_name: porteiro-app
    restart: unless-stopped
    working_dir: /app
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-porteirob}
      JWT_SECRET: ${JWT_SECRET}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NODE_ENV: production
      PORT: 3000
    ports:
      - "${APP_PORT:-3000}:3000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - porteiro-network
    command: >
      sh -c "
        apk add --no-cache git curl &&
        git clone https://github.com/SEU_USUARIO/porteiro.git . &&
        npm ci &&
        npx prisma generate &&
        npx prisma migrate deploy &&
        if [ \"$$RUN_SEED\" = \"true\" ]; then npx prisma db seed || echo 'Seed failed'; fi &&
        npm run build &&
        npm start
      "

volumes:
  postgres_data:

networks:
  porteiro-network:
```

5. **Environment variables**: Cole as variáveis do passo 1
6. **Deploy the stack**

### 3. Verificar Deploy

1. **Aguarde ~2-3 minutos** para build e deploy
2. **Acesse**: `http://SEU_IP:3000`
3. **Login inicial**: 
   - Email: `admin@porteiro.com`
   - Senha: `admin123`

### 4. Primeiros Passos

1. **Altere a senha do admin** em Configurações
2. **Adicione usuários** no painel
3. **Configure portões** conforme necessário

---

## 🔧 Para Deploy com Build Local

Se preferir fazer build local (mais rápido):

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/porteiro.git
   cd porteiro
   ```

2. **Use o docker-compose.prod.yml** já configurado

3. **No Portainer**, escolha **Upload** e envie o arquivo

---

## 🆘 Problemas Comuns

### Container não inicia
- Verifique se as variáveis estão corretas
- Veja os logs no Portainer

### Não consegue acessar
- Confirme se a porta 3000 está liberada
- Verifique o NEXTAUTH_URL

### Banco não conecta
- Aguarde o postgres inicializar (~30s)
- Verifique a senha do banco

---

**Suporte:** Consulte `DOCKER_DEPLOYMENT.md` para documentação completa 