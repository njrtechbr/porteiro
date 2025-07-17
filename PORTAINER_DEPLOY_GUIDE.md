# 🚀 Deploy do Projeto Porteiro via Portainer

Este guia mostra como fazer **deploy**, **gerenciar** e **operar** o sistema **Porteiro** através da interface web do Portainer.

## 📋 Índice

1. [Deploy da Stack Porteiro](#-deploy-da-stack-porteiro)
2. [Configuração de Variáveis](#-configuração-de-variáveis)
3. [Gerenciamento dos Containers](#-gerenciamento-dos-containers)
4. [Atualizações e Redeploy](#-atualizações-e-redeploy)
5. [Monitoramento e Logs](#-monitoramento-e-logs)
6. [Backup e Manutenção](#-backup-e-manutenção)
7. [Operações do Dia a Dia](#-operações-do-dia-a-dia)

## 🚀 Deploy da Stack Porteiro

### 1. Acessar o Portainer

1. Abra o navegador em: **http://localhost:9000**
2. Faça login com suas credenciais
3. Selecione o environment **"local"**

### 2. Criar Nova Stack

1. No menu lateral, clique em **"Stacks"**
2. Clique no botão **"+ Add stack"**
3. **Nome da stack**: `porteiro-production`

### 3. Método de Deploy

**Escolha uma das opções:**

#### Opção A: Upload do docker-compose.yml
1. Selecione **"Upload"**
2. Clique em **"Select file"**
3. Faça upload do arquivo `docker-compose.yml` do projeto

#### Opção B: Editor Web (Recomendado)
1. Selecione **"Web editor"**
2. Cole o conteúdo do `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Banco de dados PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: porteiro-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-porteirob}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-porteirob}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - porteiro-network

  # Aplicação Next.js
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: porteiro-app
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-porteirob}
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      JWT_SECRET: ${JWT_SECRET}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NODE_ENV: production
      PORT: 3000
      HOSTNAME: 0.0.0.0
      RUN_SEED: ${RUN_SEED:-false}
    ports:
      - "${APP_PORT:-3000}:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - app_uploads:/app/uploads
    networks:
      - porteiro-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Redis para cache
  redis:
    image: redis:7-alpine
    container_name: porteiro-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redis123}
    volumes:
      - redis_data:/data
    ports:
      - "${REDIS_PORT:-6379}:6379"
    networks:
      - porteiro-network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  app_uploads:
    driver: local

networks:
  porteiro-network:
    driver: bridge
```

## ⚙️ Configuração de Variáveis

Na seção **"Environment variables"**, adicione:

```env
# Banco de Dados
POSTGRES_DB=porteirob
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SuaSenhaSegura123!
POSTGRES_PORT=5432

# Autenticação JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_512_bits
NEXTAUTH_SECRET=seu_nextauth_secret_muito_seguro_aqui
NEXTAUTH_URL=http://localhost:3000

# Aplicação
APP_PORT=3000
NODE_ENV=production

# Redis
REDIS_PASSWORD=redis_senha_segura_123

# Opcional - Executar seed inicial
RUN_SEED=true
```

### 4. Deploy da Stack

1. **Revise** todas as configurações
2. Clique em **"Deploy the stack"**
3. **Aguarde** o processo de build e deploy (pode levar alguns minutos)

## 🎯 Gerenciamento dos Containers

### Visualizar Status dos Containers

1. Vá para **"Containers"** no menu lateral
2. Você verá os containers da stack:
   - 🟢 **porteiro-app** - Aplicação Next.js
   - 🟢 **porteiro-db** - PostgreSQL
   - 🟢 **porteiro-redis** - Redis Cache

### Operações Básicas

#### ✅ Iniciar/Parar Containers
1. **Selecione** o container desejado
2. Use os botões:
   - **▶️ Start** - Iniciar container
   - **⏹️ Stop** - Parar container  
   - **🔄 Restart** - Reiniciar container

#### 📋 Visualizar Logs
1. **Clique** no nome do container
2. Vá para aba **"Logs"**
3. Configure:
   - **Lines**: `100` (últimas 100 linhas)
   - **Auto-refresh**: `5s` (atualizar a cada 5 segundos)

#### 💻 Acessar Terminal do Container
1. **Clique** no nome do container
2. Vá para aba **"Console"**
3. **Command**: `/bin/bash` ou `/bin/sh`
4. Clique **"Connect"**

### Comandos Úteis nos Containers

#### Container `porteiro-app`:
```bash
# Ver status da aplicação
npm run build

# Executar migrações do banco
npm run db:migrate

# Popular dados iniciais
npm run db:seed

# Ver logs da aplicação
tail -f /var/log/app.log
```

#### Container `porteiro-db`:
```bash
# Acessar PostgreSQL
psql -U postgres -d porteirob

# Fazer backup
pg_dump -U postgres porteirob > /tmp/backup.sql

# Ver tabelas
\dt

# Sair do PostgreSQL
\q
```

## 🔄 Atualizações e Redeploy

### Update de Código da Aplicação

1. **Pare** o container `porteiro-app`:
   - Containers → Selecionar `porteiro-app` → **Stop**

2. **Rebuild** a imagem:
   - Stacks → `porteiro-production` → **Editor**
   - Clique **"Update the stack"**
   - Marque **"Re-pull image and redeploy"**
   - **Deploy**

### Update de Configurações

1. **Editar variáveis**:
   - Stacks → `porteiro-production` → **Editor**
   - Modifique as **Environment variables**
   - **Update the stack**

### Rollback de Deploy

1. **Ver histórico**:
   - Stacks → `porteiro-production` → **Editor**
   - No final da página, veja **"Stack deployment history"**

2. **Fazer rollback**:
   - Clique no deployment anterior
   - **"Redeploy"**

## 📊 Monitoramento e Logs

### Dashboard de Status

1. **Dashboard** → **Endpoints** → **local**
2. Veja métricas:
   - CPU e memória dos containers
   - Status de saúde (healthchecks)
   - Uso de rede
   - Espaço dos volumes

### Logs Centralizados

Para ver logs de todos os serviços:

1. **Containers** → **Quick actions** → **View logs**
2. Configure filtros:
   - **Since**: `1 hour ago`
   - **Level**: `All logs`
   - **Auto-refresh**: `10s`

### Alertas de Problema

Configurar notificações:

1. **Settings** → **Notifications**
2. **Add notification**:
   - **Name**: `Porteiro Alerts`
   - **URL**: `https://hooks.slack.com/...` (seu webhook)
   - **Message**: 
     ```
     🚨 PORTEIRO ALERT
     Container: {{.container.name}}
     Status: {{.container.status}}
     Time: {{.timestamp}}
     ```

## 💾 Backup e Manutenção

### Backup Automático via Portainer

1. **Stacks** → `porteiro-production` → **Editor**
2. Adicione um novo serviço de backup:

```yaml
  # Serviço de backup automático
  backup:
    image: alpine:latest
    container_name: porteiro-backup
    restart: unless-stopped
    volumes:
      - postgres_data:/data/postgres:ro
      - app_uploads:/data/uploads:ro
      - ./backups:/backups
    command: |
      sh -c "
        while true; do
          echo 'Starting backup...'
          tar czf /backups/backup_$$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
          find /backups -name '*.tar.gz' -mtime +7 -delete
          echo 'Backup completed'
          sleep 86400
        done
      "
    networks:
      - porteiro-network
```

### Backup Manual do Banco

1. **Acesse** terminal do container `porteiro-db`
2. **Execute**:
```bash
pg_dump -U postgres porteirob > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql
```
3. **Download** via Portainer:
   - Container → **Stats** → **Filesystem** → `/tmp/`

### Limpeza de Logs

Para limpar logs antigos:

1. **System** → **Clean up**
2. Selecione:
   - ✅ **Unused containers**
   - ✅ **Unused images**  
   - ✅ **Unused volumes** (⚠️ Cuidado com volumes de dados)
3. **Execute cleanup**

## 🛠️ Operações do Dia a Dia

### ✅ Checklist Diário

1. **Verificar status** dos containers (todos 🟢 healthy)
2. **Verificar logs** por erros (vermelho/warning)
3. **Verificar uso** de CPU/memória (< 80%)
4. **Testar aplicação** - http://localhost:3000

### 🔧 Comandos de Manutenção

#### Reiniciar Aplicação (sem perder dados):
```
Containers → porteiro-app → Restart
```

#### Reset completo do banco (⚠️ CUIDADO):
```
1. Stop: porteiro-app
2. Stop: porteiro-db  
3. Volumes → porteiro_postgres_data → Remove
4. Start: porteiro-db (aguardar healthy)
5. Terminal porteiro-app: npm run db:migrate && npm run db:seed
6. Start: porteiro-app
```

#### Update da aplicação:
```
1. Stacks → porteiro-production → Editor
2. Marcar "Re-pull image and redeploy"
3. Update the stack
```

### 📱 Acesso Rápido

**URLs importantes:**
- 🏠 **App Porteiro**: http://localhost:3000
- 👤 **Admin Dashboard**: http://localhost:3000/dashboard  
- 📱 **PWA Access**: http://localhost:3000/access
- 🐳 **Portainer**: http://localhost:9000
- 🗄️ **PostgreSQL**: localhost:5432
- 📡 **Redis**: localhost:6379

### 🆘 Solução Rápida de Problemas

| Problema | Solução Rápida |
|----------|----------------|
| **App não carrega** | Restart `porteiro-app` |
| **Erro de banco** | Verificar logs `porteiro-db` → Restart se necessário |
| **Login não funciona** | Verificar JWT_SECRET nas env vars |
| **Lentidão** | Verificar uso CPU/RAM no Dashboard |
| **Erro 500** | Logs `porteiro-app` → Terminal para debug |

---

## 🎉 Pronto para Produção!

Agora você sabe como **operar completamente** o sistema Porteiro através do Portainer! Use este guia como referência rápida para deploy, monitoramento e manutenção do sistema.

**💡 Dica**: Marque as URLs importantes como favoritos e mantenha o Portainer sempre aberto em uma aba para monitoramento contínuo! 