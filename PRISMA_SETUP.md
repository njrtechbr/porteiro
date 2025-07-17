# Configuração do Prisma + PostgreSQL

Este documento explica como configurar e usar o Prisma com PostgreSQL no projeto Porteiro.

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. **PostgreSQL** instalado e rodando
2. **Node.js** v18 ou superior
3. Um banco de dados PostgreSQL criado

## 🔧 Configuração

### 1. Configurar as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/porteiro_db?schema=public"

# Genkit AI
GOOGLE_GENAI_API_KEY="sua-chave-google-ai"

# Next.js
NEXTAUTH_SECRET="seu-secret-nextauth"
NEXTAUTH_URL="http://localhost:9002"

# Home Assistant (opcional)
HOME_ASSISTANT_URL="http://seu-home-assistant:8123"
HOME_ASSISTANT_TOKEN="seu-token-home-assistant"
```

### 2. Executar as Migrações

```bash
# Aplicar migrações ao banco de dados
npm run db:migrate

# Ou se for um ambiente de produção
npm run db:push
```

### 3. Popular o Banco com Dados Iniciais

```bash
# Executar seed para criar dados de exemplo
npm run db:seed
```

### 4. Gerar o Cliente Prisma

```bash
# Gerar o cliente Prisma (necessário após mudanças no schema)
npm run db:generate
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `users`
- Armazena todos os usuários (Admin, Família, Hóspede, Convidado)
- Campos: id, name, email, cpf, role, accessStart, accessEnd, accessCode, invites, avatar, status, accessibleGates

#### `access_logs`
- Registra todas as ações do sistema
- Campos: id, userId, action, details, timestamp

### Relacionamentos

- `AccessLog` → `User` (muitos para um)
- Cascade delete: Se um usuário for deletado, seus logs também são

## 🛠️ Scripts Disponíveis

```bash
# Aplicar migrações em desenvolvimento
npm run db:migrate

# Aplicar mudanças do schema diretamente ao banco
npm run db:push

# Gerar o cliente Prisma
npm run db:generate

# Executar seed (popular com dados iniciais)
npm run db:seed

# Resetar banco de dados (CUIDADO: apaga todos os dados)
npm run db:reset

# Abrir Prisma Studio (interface visual)
npm run db:studio
```

## 📊 Dados de Exemplo

Após executar o seed, você terá:

### Usuários Criados:
- **Admin**: admin@porteiro.com (João Silva)
- **Família**: maria@familia.com (Maria Silva)
- **Hóspede**: pedro@hospede.com (Pedro Santos)
- **Convidado**: ana@convidado.com (Ana Costa - pendente)

### Logs de Exemplo:
- Sistema iniciado
- Portão acionado
- Acesso ativado

## 🔄 Fluxo de Desenvolvimento

1. **Modificar Schema**: Edite `prisma/schema.prisma`
2. **Criar Migração**: `npm run db:migrate`
3. **Aplicar Mudanças**: `npm run db:generate`
4. **Testar**: Use `npm run db:studio` para visualizar

## 🚀 Produção

Para produção, use:

```bash
# Aplicar schema sem criar migração
npm run db:push

# Executar seed em produção
npm run db:seed
```

## 🔍 Troubleshooting

### Erro de Conexão
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `DATABASE_URL`
- Teste a conexão: `psql -U usuario -d porteiro_db`

### Schema Desatualizado
```bash
npm run db:generate
```

### Resetar Tudo
```bash
npm run db:reset
npm run db:seed
```

## 📖 Documentação Adicional

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js + Prisma](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) 