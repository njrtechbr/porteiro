# Documentação do Esquema do Banco de Dados (PostgreSQL)

Este documento detalha o esquema das tabelas do banco de dados PostgreSQL para o sistema "Porteiro". Ele foi projetado para ser usado com um ORM como o Prisma, mas as definições SQL são fornecidas para clareza.

---

## Diagrama de Relacionamento (Simplificado)

```
+----------------+      +------------------+
|     users      |      |   access_logs    |
+----------------+      +------------------+
| id (PK)        |      | id (PK)          |
| name           |      | user_id (FK)  -----*|
| email          |      | action           |
| cpf            |      | details          |
| role           |      | timestamp        |
| access_start   |      |                  |
| access_end     |      |                  |
| access_code    |      +------------------+
| invites        |
| avatar         |
| status         |
| accessible_gates |
+----------------+
```

---

## Tabela: `users`

Armazena as informações de todos os usuários do sistema, incluindo administradores, familiares e convidados.

### Colunas

| Nome da Coluna     | Tipo de Dado         | Restrições e Descrição                                                                      |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------- |
| `id`               | `TEXT` ou `UUID`     | **Chave Primária**. Identificador único para o usuário. `UUID` é recomendado.                 |
| `name`             | `TEXT`               | `NOT NULL`. Nome completo do usuário.                                                       |
| `email`            | `TEXT`               | `NOT NULL`, `UNIQUE`. Endereço de e-mail do usuário.                                        |
| `cpf`              | `TEXT`               | `NOT NULL`, `UNIQUE`. CPF do usuário, para identificação fiscal (coletado no cadastro).       |
| `role`             | `TEXT`               | `NOT NULL`. Define o papel do usuário. Restrito a: 'Admin', 'Família', 'Hóspede', 'Convidado'. |
| `access_start`     | `TIMESTAMP WITH TIME ZONE` | `NULLABLE`. Data e hora de início do período de acesso. `NULL` para acesso permanente.    |
| `access_end`       | `TIMESTAMP WITH TIME ZONE` | `NULLABLE`. Data e hora de fim do período de acesso. `NULL` para acesso permanente.       |
| `access_code`      | `TEXT`               | `NOT NULL`, `UNIQUE`. Código único para finalizar o cadastro e/ou para acesso.               |
| `invites`          | `INTEGER`            | `NOT NULL`, `DEFAULT 0`. Número de convites que um hóspede pode enviar.                     |
| `avatar`           | `TEXT`               | `NULLABLE`. URL para a imagem de avatar do usuário.                                         |
| `status`           | `TEXT`               | `NOT NULL`. Status da conta. Restrito a: 'ativo', 'pendente', 'expirado'.                  |
| `accessible_gates` | `TEXT[]`             | `NOT NULL`. Um array de strings com os IDs dos portões que o usuário pode acessar.            |
| `created_at`       | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`. Data de criação do registro.                                   |
| `updated_at`       | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`. Data da última atualização do registro.                        |

### Definição SQL (Exemplo)

```sql
-- Criação do ENUM para os papéis (opcional, mas recomendado)
CREATE TYPE user_role AS ENUM ('Admin', 'Família', 'Hóspede', 'Convidado');

-- Criação do ENUM para o status (opcional, mas recomendado)
CREATE TYPE user_status AS ENUM ('ativo', 'pendente', 'expirado');

CREATE TABLE users (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "cpf" TEXT NOT NULL UNIQUE,
    "role" user_role NOT NULL,
    "access_start" TIMESTAMP WITH TIME ZONE,
    "access_end" TIMESTAMP WITH TIME ZONE,
    "access_code" TEXT NOT NULL UNIQUE,
    "invites" INTEGER NOT NULL DEFAULT 0,
    "avatar" TEXT,
    "status" user_status NOT NULL,
    "accessible_gates" TEXT[] NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

## Tabela: `access_logs`

Registra todas as ações importantes realizadas no sistema, como acionamentos de portão, concessão de acesso e atualizações de usuários.

### Colunas

| Nome da Coluna | Tipo de Dado         | Restrições e Descrição                                                       |
| -------------- | -------------------- | ---------------------------------------------------------------------------- |
| `id`           | `TEXT` ou `UUID`     | **Chave Primária**. Identificador único para a entrada de log.                 |
| `user_id`      | `TEXT` ou `UUID`     | **Chave Estrangeira** para `users(id)`. `NOT NULL`. O usuário que realizou a ação. |
| `action`       | `TEXT`               | `NOT NULL`. Descrição curta da ação (ex: 'Portão Acionado').                 |
| `details`      | `TEXT`               | `NULLABLE`. Detalhes adicionais sobre a ação (ex: localização GPS).          |
| `timestamp`    | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT now()`. Data e hora em que a ação ocorreu.              |

### Definição SQL (Exemplo)

```sql
CREATE TABLE access_logs (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT fk_user
        FOREIGN KEY("user_id")
        REFERENCES users("id")
        ON DELETE CASCADE -- Se um usuário for deletado, seus logs também serão.
);

-- Criar um índice na coluna `user_id` para otimizar as buscas por logs de um usuário específico.
CREATE INDEX idx_access_logs_user_id ON access_logs("user_id");
```
