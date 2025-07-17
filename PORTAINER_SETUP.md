# 🐳 Guia Passo a Passo: Configuração do Portainer para o Projeto Porteiro

Este guia fornece instruções detalhadas para configurar o **Portainer** como interface de gerenciamento para os containers Docker do sistema **Porteiro**.

## 📋 Índice

1. [Pré-requisitos](#-pré-requisitos)
2. [Instalação do Portainer](#-instalação-do-portainer)
3. [Configuração Inicial](#-configuração-inicial)
4. [Gerenciamento dos Serviços do Porteiro](#-gerenciamento-dos-serviços-do-porteiro)
5. [Monitoramento e Logs](#-monitoramento-e-logs)
6. [Backup e Restore](#-backup-e-restore)
7. [Solução de Problemas](#-solução-de-problemas)

## 🔧 Pré-requisitos

Antes de iniciar, certifique-se de que você possui:

- ✅ **Docker** instalado e funcionando
- ✅ **Docker Compose** instalado
- ✅ **Projeto Porteiro** clonado e configurado
- ✅ **Portas livres**: 9000 (Portainer) e 8000 (Portainer Agent)

### Verificando Docker

```powershell
# Verificar se o Docker está funcionando
docker --version
docker-compose --version

# Verificar se o Docker está rodando
docker ps
```

## 🚀 Instalação do Portainer

### Método 1: Docker Compose (Recomendado)

1. **Criar arquivo docker-compose.portainer.yml**

Crie um novo arquivo na raiz do projeto:

```yaml
version: '3.8'

services:
  # Portainer Community Edition
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - portainer_data:/data
    ports:
      - "9000:9000"
      - "9443:9443"
    command: --admin-password-file=/data/admin_password
    environment:
      - PORTAINER_ADMIN_PASSWORD_FILE=/data/admin_password
    networks:
      - porteiro-network

  # Portainer Agent (para múltiplos Docker hosts)
  portainer-agent:
    image: portainer/agent:latest
    container_name: portainer-agent
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /var/lib/docker/volumes:/var/lib/docker/volumes:ro
    ports:
      - "9001:9001"
    networks:
      - porteiro-network

volumes:
  portainer_data:
    driver: local

networks:
  porteiro-network:
    external: true
```

2. **Criar senha de administrador**

```powershell
# Criar diretório para dados do Portainer
mkdir portainer_data -ErrorAction SilentlyContinue

# Gerar hash da senha (substitua 'minhasenha123' pela sua senha)
echo "minhasenha123" | docker run --rm -i portainer/portainer-ce:latest --hash-password > portainer_data/admin_password
```

3. **Iniciar o Portainer**

```powershell
# Garantir que a network existe
docker network create porteiro-network --driver bridge -ErrorAction SilentlyContinue

# Subir o Portainer
docker-compose -f docker-compose.portainer.yml up -d
```

### Método 2: Docker Run Simples

```powershell
# Criar volume para dados
docker volume create portainer_data

# Executar Portainer
docker run -d `
  --name portainer `
  --restart=unless-stopped `
  -p 9000:9000 `
  -p 9443:9443 `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -v portainer_data:/data `
  portainer/portainer-ce:latest
```

## ⚙️ Configuração Inicial

### 1. Acessar Interface Web

Abra seu navegador e acesse:
- **HTTP**: http://localhost:9000
- **HTTPS**: https://localhost:9443

### 2. Configuração Inicial do Admin

1. **Primeira vez**: Será solicitado criar usuário administrador
   - **Username**: `admin`
   - **Password**: `minhasenha123` (ou a senha que você definiu)

2. **Selecionar Environment**: Escolha "Get Started with Local environment"

3. **Conectar ao Docker**: O Portainer detectará automaticamente o Docker local

### 3. Importar Stack do Porteiro

1. **Acesse "Stacks"** no menu lateral
2. **Clique em "Add Stack"**
3. **Nome**: `porteiro-stack`
4. **Build method**: "Upload"
5. **Upload** o arquivo `docker-compose.yml` do projeto
6. **Environment variables**: Adicione as variáveis do `.env`:

```env
POSTGRES_DB=porteirob
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
JWT_SECRET=seu_jwt_secret_aqui
NEXTAUTH_SECRET=seu_nextauth_secret_aqui
NEXTAUTH_URL=http://localhost:3000
APP_PORT=3000
REDIS_PASSWORD=redis123
REDIS_PORT=6379
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

7. **Deploy the stack**

## 🎯 Gerenciamento dos Serviços do Porteiro

### Visualizar Containers

No Portainer, acesse **"Containers"** para ver todos os serviços:

- 🟢 `porteiro-app` - Aplicação Next.js
- 🟢 `porteiro-db` - PostgreSQL Database
- 🟢 `porteiro-redis` - Redis Cache
- 🟢 `porteiro-nginx` - Nginx Proxy

### Operações Básicas

#### Parar/Iniciar Containers
1. Selecione o container
2. Use os botões **"Stop"** / **"Start"** / **"Restart"**

#### Visualizar Logs
1. Clique no nome do container
2. Vá para aba **"Logs"**
3. Configure auto-refresh para monitoramento em tempo real

#### Acessar Terminal
1. Clique no nome do container
2. Vá para aba **"Console"**
3. Clique **"Connect"** para abrir terminal

### Comandos Úteis via Terminal

```bash
# Dentro do container porteiro-app
npm run db:migrate    # Executar migrações
npm run db:seed      # Popular banco com dados iniciais
npm run build        # Build da aplicação

# Dentro do container porteiro-db
psql -U postgres -d porteirob    # Acessar PostgreSQL
pg_dump porteirob > backup.sql   # Backup do banco
```

## 📊 Monitoramento e Logs

### Dashboard de Containers

No **Dashboard** você pode ver:
- Status de todos os containers
- Uso de CPU e Memória
- Estatísticas de rede
- Espaço em disco dos volumes

### Configurar Alertas

1. **Settings > Notifications**
2. Configure webhook para Slack/Discord:

```json
{
  "text": "🚨 Container {{.container.name}} está {{.container.status}}",
  "channel": "#infra-alerts"
}
```

### Logs Centralizados

Para visualizar logs de todos os serviços:

1. **Containers > Actions > View Logs**
2. Ative **"Auto-refresh logs"**
3. Use filtros por timestamp e nível

## 💾 Backup e Restore

### Backup dos Volumes

```powershell
# Backup do banco PostgreSQL
docker exec porteiro-db pg_dump -U postgres porteirob > backup_porteiro_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Backup dos uploads da aplicação
docker run --rm -v porteiro_app_uploads:/data -v ${PWD}:/backup alpine tar czf /backup/uploads_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").tar.gz -C /data .

# Backup das configurações do Portainer
docker run --rm -v portainer_data:/data -v ${PWD}:/backup alpine tar czf /backup/portainer_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").tar.gz -C /data .
```

### Restore

```powershell
# Restore do banco
cat backup_porteiro_YYYYMMDD_HHMMSS.sql | docker exec -i porteiro-db psql -U postgres -d porteirob

# Restore dos uploads
docker run --rm -v porteiro_app_uploads:/data -v ${PWD}:/backup alpine tar xzf /backup/uploads_backup_YYYYMMDD_HHMMSS.tar.gz -C /data

# Restore do Portainer
docker run --rm -v portainer_data:/data -v ${PWD}:/backup alpine tar xzf /backup/portainer_backup_YYYYMMDD_HHMMSS.tar.gz -C /data
```

## 🔧 Solução de Problemas

### Container não inicia

1. **Verificar logs** no Portainer
2. **Verificar configuração** nas Environment Variables
3. **Verificar dependências** (banco deve estar healthy)

```powershell
# Verificar health checks
docker ps --format "table {{.Names}}\t{{.Status}}"

# Verificar logs específicos
docker logs porteiro-app --tail 50
```

### Problemas de Conectividade

```powershell
# Verificar redes Docker
docker network ls
docker network inspect porteiro-network

# Testar conectividade entre containers
docker exec porteiro-app ping porteiro-db
```

### Aplicação não acessa o banco

1. **Verificar variáveis de ambiente** no container
2. **Verificar se o PostgreSQL está healthy**
3. **Verificar string de conexão**

```bash
# Dentro do container da aplicação
echo $DATABASE_URL

# Testar conexão com o banco
nc -zv postgres 5432
```

### Reset Completo

Em caso de problemas graves:

```powershell
# Parar todos os containers
docker-compose -f docker-compose.yml down

# Remover volumes (CUIDADO: isso apaga os dados)
docker volume rm porteiro_postgres_data porteiro_redis_data porteiro_app_uploads

# Recriar do zero
docker-compose -f docker-compose.yml up -d
```

## 🎉 Pronto!

Agora você tem o **Portainer** configurado para gerenciar completamente o sistema **Porteiro**. Use a interface web para monitorar, gerenciar e fazer debugging dos seus containers de forma visual e intuitiva.

### Links Úteis

- **Portainer**: http://localhost:9000
- **Aplicação Porteiro**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Próximos Passos

1. Configure monitoramento com alertas
2. Implemente rotina de backup automatizada
3. Configure HTTPS para produção
4. Explore templates de aplicação no Portainer

---

**💡 Dica**: Marque este arquivo como favorito para consultas rápidas durante o desenvolvimento e manutenção do sistema! 