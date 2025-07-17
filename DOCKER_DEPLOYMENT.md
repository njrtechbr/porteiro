# 🐳 Deploy com Docker Compose - Portainer

Esta documentação explica como fazer o deploy da aplicação Porteiro usando Docker Compose no Portainer.

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose v2.0+
- Portainer instalado e configurado
- Domínio ou IP público configurado
- Certificados SSL (recomendado para produção)

## 🚀 Deploy no Portainer

### 1. Preparação dos Arquivos

1. **Clone ou copie os arquivos necessários:**
   ```bash
   git clone [seu-repositorio]
   cd porteiro
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.production .env
   ```

3. **Edite o arquivo `.env` com suas configurações:**
   ```bash
   nano .env
   ```

### 2. Configurações Essenciais

#### 🌐 Configuração de Domínio

No arquivo `.env`, configure a URL da aplicação:

```env
# Para domínio personalizado
NEXTAUTH_URL=https://porteiro.seudominio.com

# Para IP local
NEXTAUTH_URL=http://192.168.1.100:3000

# Para localhost
NEXTAUTH_URL=http://localhost:3000
```

#### 🔒 Configurações de Segurança

**IMPORTANTE**: Altere os seguintes valores antes do deploy:

```env
# Gere uma nova chave JWT (512-bit)
JWT_SECRET=sua_nova_chave_jwt_aqui

# Gere um novo secret para NextAuth
NEXTAUTH_SECRET=seu_novo_nextauth_secret_aqui

# Senha do banco de dados
POSTGRES_PASSWORD=SuaSenhaSeguraAqui123!

# Senha do Redis
REDIS_PASSWORD=redis123SenhaSegura!
```

### 3. Deploy via Portainer

#### Opção A: Stack via Git Repository

1. **Acesse Portainer** → **Stacks** → **Add Stack**
2. **Name**: `porteiro-production`
3. **Build method**: Repository
4. **Repository URL**: `https://github.com/seu-usuario/porteiro`
5. **Repository reference**: `refs/heads/main`
6. **Compose path**: `docker-compose.yml`
7. **Environment variables**: Cole o conteúdo do `.env`
8. **Deploy the stack**

#### Opção B: Stack via Upload

1. **Acesse Portainer** → **Stacks** → **Add Stack**
2. **Name**: `porteiro-production`
3. **Build method**: Upload
4. **Upload**: Faça upload do `docker-compose.yml`
5. **Environment variables**: Cole o conteúdo do `.env`
6. **Deploy the stack**

#### Opção C: Stack via Editor Web

1. **Acesse Portainer** → **Stacks** → **Add Stack**
2. **Name**: `porteiro-production`
3. **Build method**: Web editor
4. **Web editor**: Cole o conteúdo do `docker-compose.yml`
5. **Environment variables**: Cole o conteúdo do `.env`
6. **Deploy the stack**

### 4. Verificação do Deploy

1. **Verifique os containers:**
   ```bash
   docker ps
   ```

2. **Verifique os logs:**
   ```bash
   docker logs porteiro-app
   docker logs porteiro-db
   ```

3. **Teste a aplicação:**
   - Acesse: `http://seu-ip:3000` ou `https://seu-dominio.com`

## 🔧 Configurações Avançadas

### SSL/TLS (HTTPS)

Para habilitar HTTPS, você precisa de certificados SSL:

1. **Crie o diretório para certificados:**
   ```bash
   mkdir -p nginx/ssl
   ```

2. **Adicione seus certificados:**
   ```bash
   # Certificado
   nginx/ssl/cert.pem
   
   # Chave privada
   nginx/ssl/key.pem
   ```

3. **Para Let's Encrypt (Certbot):**
   ```bash
   # No host Docker
   certbot certonly --standalone -d seu-dominio.com
   
   # Copie os certificados
   cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem nginx/ssl/cert.pem
   cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem nginx/ssl/key.pem
   ```

### Backup do Banco de Dados

```bash
# Criar backup
docker exec porteiro-db pg_dump -U postgres porteirob > backup.sql

# Restaurar backup
docker exec -i porteiro-db psql -U postgres porteirob < backup.sql
```

### Monitoramento

Adicione ao docker-compose.yml se desejar monitoramento:

```yaml
  # Prometheus (opcional)
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  # Grafana (opcional)
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
```

## 🌍 Configurações por Ambiente

### Desenvolvimento Local

```bash
# Use o override para desenvolvimento
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

### Produção

```bash
# Deploy apenas serviços de produção
docker-compose --profile production up -d
```

### Staging

Crie um `.env.staging`:

```env
NEXTAUTH_URL=https://staging.porteiro.seudominio.com
POSTGRES_DB=porteiro_staging
# ... outras configurações
```

## 🔍 Troubleshooting

### Container não inicia

1. **Verifique os logs:**
   ```bash
   docker logs porteiro-app --tail 50
   ```

2. **Verifique variáveis de ambiente:**
   ```bash
   docker exec porteiro-app env | grep DATABASE_URL
   ```

### Banco não conecta

1. **Teste conectividade:**
   ```bash
   docker exec porteiro-app pg_isready -h postgres -p 5432
   ```

2. **Verifique saúde do PostgreSQL:**
   ```bash
   docker exec porteiro-db pg_isready
   ```

### Aplicação retorna 502

1. **Verifique se a app está rodando:**
   ```bash
   docker exec porteiro-app curl http://localhost:3000/api/health
   ```

2. **Verifique configuração do Nginx:**
   ```bash
   docker exec porteiro-nginx nginx -t
   ```

## 📚 Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO!)
docker-compose down -v

# Rebuild da aplicação
docker-compose build app

# Ver logs em tempo real
docker-compose logs -f app

# Executar comando no container
docker exec -it porteiro-app sh

# Backup completo
docker-compose exec postgres pg_dumpall -c -U postgres > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
```

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
# 1. Pull da nova versão
git pull origin main

# 2. Rebuild e restart
docker-compose build app
docker-compose up -d app

# 3. Aplicar migrações (se necessário)
docker exec porteiro-app npx prisma migrate deploy
```

## ⚠️ Considerações de Segurança

1. **Sempre altere as senhas padrão**
2. **Use HTTPS em produção**
3. **Configure firewall adequadamente**
4. **Mantenha backups regulares**
5. **Monitore logs de acesso**
6. **Atualize dependências regularmente**

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs dos containers
2. Consulte a documentação do Portainer
3. Verifique conectividade de rede
4. Confirme configurações de DNS

---

**Criado para o sistema Porteiro** 🏠 