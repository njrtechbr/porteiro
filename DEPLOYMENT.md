# 🚀 Guia de Deploy - Sistema Porteiro

Este documento detalha como fazer o deploy do Sistema Porteiro em ambientes de produção com máxima segurança.

## 📋 Pré-requisitos de Produção

### Infraestrutura Necessária
- **Servidor**: VPS/Dedicado com pelo menos 2GB RAM
- **Sistema Operacional**: Ubuntu 20.04+ ou CentOS 8+
- **Node.js**: Versão 18 LTS ou superior
- **PostgreSQL**: Versão 12+ (recomendado 14+)
- **Nginx**: Para proxy reverso e SSL
- **Certbot**: Para certificados SSL Let's Encrypt

### Domínio e SSL
- **Domínio próprio**: Ex: `porteiro.suaempresa.com`
- **Certificado SSL**: Obrigatório para JWT e geolocalização
- **Subdominios**: `api.porteiro.com` (opcional)

## 🔧 Configuração do Servidor

### 1. Preparação do Sistema
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y nginx postgresql postgresql-contrib nodejs npm git

# Instalar PM2 para gerenciamento de processos
sudo npm install -g pm2
```

### 2. Configuração do PostgreSQL
```bash
# Configurar PostgreSQL
sudo -u postgres psql

-- Criar usuário e banco
CREATE USER porteiro_user WITH PASSWORD 'senha_super_segura_aqui';
CREATE DATABASE porteiro_prod OWNER porteiro_user;
GRANT ALL PRIVILEGES ON DATABASE porteiro_prod TO porteiro_user;
\q

# Configurar acesso
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Adicionar: local   porteiro_prod   porteiro_user   md5
```

### 3. Configuração de Variáveis de Ambiente (.env.production)
```env
# Database Production
DATABASE_URL="postgresql://porteiro_user:senha_super_segura_aqui@localhost:5432/porteiro_prod"

# JWT Security (GERAR NOVA CHAVE!)
JWT_SECRET="chave-jwt-producao-512-bits-extremamente-segura-nunca-compartilhar-esta-chave-secreta-super-longa"

# Next.js Production
NEXTAUTH_SECRET="outro-secret-producao-diferente-do-jwt"
NEXTAUTH_URL="https://porteiro.suaempresa.com"
NODE_ENV="production"

# AI Integration (Opcional)
GOOGLE_GENAI_API_KEY="sua-chave-real-google-ai"

# Home Assistant (Configurar IPs/URLs reais)
HOME_ASSISTANT_URL="http://seu-home-assistant-real:8123"
HOME_ASSISTANT_TOKEN="token-real-home-assistant"

# Logs e Debug
LOG_LEVEL="error"
DEBUG="false"
```

## 🔐 Segurança de Produção

### 1. Geração de Chaves Seguras
```bash
# Gerar JWT_SECRET (512-bit)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Gerar NEXTAUTH_SECRET
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configuração de Firewall
```bash
# UFW Firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 9002  # Bloquear porta direta da aplicação
```

### 3. Configuração do Nginx
```nginx
# /etc/nginx/sites-available/porteiro
server {
    listen 80;
    server_name porteiro.suaempresa.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name porteiro.suaempresa.com;

    ssl_certificate /etc/letsencrypt/live/porteiro.suaempresa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/porteiro.suaempresa.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:";

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📦 Deploy da Aplicação

### 1. Clone e Configuração
```bash
# Clonar repositório
cd /var/www
sudo git clone https://github.com/seu-usuario/porteiro.git
cd porteiro

# Configurar permissões
sudo chown -R $USER:www-data /var/www/porteiro
sudo chmod -R 755 /var/www/porteiro

# Instalar dependências
npm ci --production
```

### 2. Build e Migrações
```bash
# Copiar arquivo de produção
cp .env.production .env

# Executar migrações
npm run db:push
npm run db:seed

# Build da aplicação
npm run build
```

### 3. Configuração do PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'porteiro-prod',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/porteiro',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 9002
    },
    error_file: '/var/log/porteiro/error.log',
    out_file: '/var/log/porteiro/out.log',
    log_file: '/var/log/porteiro/combined.log',
    time: true
  }]
};
```

### 4. Inicialização
```bash
# Criar diretório de logs
sudo mkdir -p /var/log/porteiro
sudo chown $USER:$USER /var/log/porteiro

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔄 Monitoramento e Manutenção

### 1. Logs e Monitoramento
```bash
# Logs da aplicação
pm2 logs porteiro-prod

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Status da aplicação
pm2 status
pm2 monit
```

### 2. Backup Automatizado
```bash
#!/bin/bash
# /scripts/backup-porteiro.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/porteiro"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -U porteiro_user -h localhost porteiro_prod > "$BACKUP_DIR/db_$DATE.sql"

# Backup dos arquivos
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" /var/www/porteiro

# Remover backups antigos (7 dias)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup concluído: $DATE"
```

### 3. Crontab para Backups
```bash
# Editar crontab
crontab -e

# Adicionar backup diário às 2h
0 2 * * * /scripts/backup-porteiro.sh
```

## 🚨 Procedimentos de Emergência

### 1. Rollback de Deploy
```bash
# Parar aplicação
pm2 stop porteiro-prod

# Restaurar backup anterior
cd /var/www
sudo rm -rf porteiro
sudo tar -xzf /backups/porteiro/files_YYYYMMDD_HHMMSS.tar.gz

# Restaurar banco
psql -U porteiro_user -h localhost porteiro_prod < /backups/porteiro/db_YYYYMMDD_HHMMSS.sql

# Reiniciar aplicação
pm2 start porteiro-prod
```

### 2. Verificações de Saúde
```bash
# Script de verificação
#!/bin/bash
# /scripts/health-check.sh

# Verificar aplicação
curl -f http://localhost:9002/ || echo "App DOWN"

# Verificar banco
pg_isready -U porteiro_user -h localhost -d porteiro_prod || echo "DB DOWN"

# Verificar Nginx
nginx -t || echo "Nginx config error"
```

## 📊 Otimização de Performance

### 1. PostgreSQL Tuning
```sql
-- /etc/postgresql/14/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

### 2. Next.js Otimizações
```javascript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['porteiro.suaempresa.com']
    }
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        }
      ]
    }
  ]
};

module.exports = nextConfig;
```

## ✅ Checklist de Deploy

### Pré-deploy
- [ ] Backup do sistema atual
- [ ] Teste em ambiente de staging
- [ ] Verificação de dependências
- [ ] Validação das variáveis de ambiente

### Deploy
- [ ] Build sem erros
- [ ] Migrações executadas com sucesso
- [ ] Configuração de SSL
- [ ] Firewall configurado
- [ ] PM2 iniciado corretamente

### Pós-deploy
- [ ] Teste de login admin
- [ ] Teste de criação de usuário
- [ ] Teste de acionamento de portão
- [ ] Verificação de logs
- [ ] Teste de backup
- [ ] Monitoramento ativo

## 🔧 Troubleshooting Comum

### Problema: JWT_SECRET não configurado
```bash
# Solução
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" >> .env
```

### Problema: Conexão com banco
```bash
# Verificar conexão
psql -U porteiro_user -h localhost -d porteiro_prod

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Problema: Certificado SSL
```bash
# Renovar certificado
sudo certbot renew --dry-run
sudo certbot renew
sudo systemctl reload nginx
```

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o deploy:
- 📧 Email: suporte@porteiro.com
- 📚 Documentação: [DOCUMENTATION.md](./DOCUMENTATION.md)
- 🔒 Segurança: [SECURITY_ALGORITHM.md](./SECURITY_ALGORITHM.md)
- 🗄️ Banco: [PRISMA_SETUP.md](./PRISMA_SETUP.md)

---

**⚠️ IMPORTANTE**: Nunca compartilhe as chaves JWT_SECRET ou credenciais de banco em repositórios públicos. Use sempre variáveis de ambiente seguras em produção. 