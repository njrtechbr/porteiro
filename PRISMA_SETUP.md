# Configuração do Prisma + PostgreSQL - Sistema Porteiro

Este documento explica como configurar e usar o Prisma com PostgreSQL no projeto Porteiro, incluindo as funcionalidades avançadas de segurança JWT, revogação em cascata e sistema de configurações.

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. **PostgreSQL** 12+ instalado e rodando
2. **Node.js** v18 ou superior
3. **Banco de dados PostgreSQL** criado (recomendado: `porteiro`)
4. **Chaves de API** para integração com IA (opcional)

## 🔧 Configuração

### 1. Configurar as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/porteiro?schema=public"

# JWT Security (OBRIGATÓRIO)
JWT_SECRET="sua-chave-jwt-512-bits-super-secreta-para-assinatura-de-tokens-jwt-porteiro-sistema"

# Next.js Authentication
NEXTAUTH_SECRET="seu-secret-nextauth-diferente-do-jwt"
NEXTAUTH_URL="http://localhost:9002"

# AI Integration (Opcional)
GOOGLE_GENAI_API_KEY="sua-chave-google-ai-para-geracao-de-termos"

# Home Assistant Integration (Opcional)
HOME_ASSISTANT_URL="http://seu-home-assistant:8123"
HOME_ASSISTANT_TOKEN="seu-token-home-assistant-para-portoes"
```

### ⚠️ Configurações Críticas de Segurança

#### JWT_SECRET
- **OBRIGATÓRIO**: Sistema não funciona sem esta chave
- **Tamanho**: Mínimo 64 caracteres (recomendado 128+)
- **Formato**: String aleatória complexa
- **Geração**: Use `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

#### DATABASE_URL
- **Formato**: `postgresql://usuario:senha@host:porta/database`
- **Exemplo Local**: `postgresql://postgres:postgres@localhost:5432/porteiro`
- **Produção**: Use variáveis de ambiente seguras

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

#### `users` - Tabela Central de Usuários
- **Função**: Armazena todos os usuários (Admin, Família, Hóspede, Convidado)
- **Campos Principais**:
  - `id`: Identificador único (CUID)
  - `name`, `email`: Dados básicos do usuário
  - `cpf`: CPF (opcional, com validação)
  - `role`: Papel (Admin, Familia, Hospede, Convidado)
  - `accessStart`, `accessEnd`: Período de acesso
  - `accessCode`: Código único para convite
  - `status`: Status atual (ativo, pendente, expirado)
  - `accessibleGates`: Array de portões permitidos
  - `password`: Senha criptografada (bcrypt)
  - `invitedById`: ID do usuário que convidou (hierarquia)

#### `access_logs` - Auditoria Completa
- **Função**: Registra todas as ações do sistema
- **Campos**:
  - `id`: Identificador único
  - `userId`: Referência ao usuário
  - `action`: Tipo de ação realizada
  - `details`: Detalhes específicos
  - `timestamp`: Data/hora da ação
- **Tipos de Log**:
  - "Acesso Revogado" - Revogação individual
  - "Acesso Revogado (Cascata)" - Revogação automática
  - "Usuário Reativado" - Restauração de acesso
  - "Senha Alterada" - Redefinição por admin
  - "Portão Acionado" - Acionamento autorizado

#### `settings` - Sistema de Configurações
- **Função**: Armazena configurações dinâmicas do sistema
- **Campos**:
  - `id`: Identificador único
  - `key`: Chave da configuração (ex: "property.name")
  - `value`: Valor da configuração (JSON flexível)
  - `createdAt`, `updatedAt`: Timestamps
- **Categorias**:
  - `property.*`: Informações da propriedade
  - `general.*`: Configurações gerais
  - `guest.*`: Configurações de convidados
  - `integration.*`: Integrações externas
  - `gates.*`: Configurações dos portões

### Relacionamentos e Integridade

#### Hierarquia de Usuários
- `User.invitedBy` → `User` (auto-relacionamento)
- `User.invitedUsers` → `User[]` (relacionamento reverso)
- **Cascata**: Revogação de hóspede revoga todos os convidados

#### Logs de Auditoria
- `AccessLog.user` → `User` (muitos para um)
- **Cascade Delete**: Logs são removidos se usuário for deletado
- **Index**: Otimização para consultas por usuário

#### Configurações Flexíveis
- **Sem FK**: Tabela independente para máxima flexibilidade
- **JSON Values**: Suporte a configurações complexas
- **Unique Keys**: Previne duplicação de configurações

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
- **Admin**: admin@admin.com (Administrador)
  - Senha: `password` (criptografada com bcrypt)
  - Status: ativo
  - Acesso: todos os portões

- **Usuário Teste**: teste@expirado.com (Usuário Teste)
  - Senha: `123456` (para testes de período expirado)
  - Status: ativo (mas com período expirado)
  - Acesso: portão Nicarágua

### Configurações Iniciais:
- **Nome da Propriedade**: "Porteiro - Sistema de Acesso"
- **Endereço**: "Rua das Flores, 123 - Centro"
- **Mensagem de Boas-vindas**: Template personalizado
- **Home Assistant**: URLs e tokens de exemplo

### Logs de Sistema:
- Sistema iniciado
- Usuários criados
- Configurações inicializadas
- Testes de validação de segurança

### Funcionalidades Testadas:
- ✅ Autenticação JWT
- ✅ Validação de períodos
- ✅ Revogação em cascata
- ✅ Sistema de configurações
- ✅ Logs de auditoria

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