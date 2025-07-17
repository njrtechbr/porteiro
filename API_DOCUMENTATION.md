# Documentação da API do Sistema Porteiro

Este documento detalha a "API" do sistema Porteiro. É importante notar que, em vez de uma API REST ou GraphQL tradicional com endpoints HTTP, a lógica de backend é implementada usando **Next.js Server Actions**. Essas ações são funções assíncronas que rodam no servidor e podem ser chamadas diretamente de componentes React (Server e Client Components).

A camada de serviço está dividida em duas partes principais:
1.  **Ações de Dados (`src/lib/actions.ts`)**: Funções que manipulam os dados simulados da aplicação (usuários, logs). No futuro, essas funções seriam o local para integrar com um banco de dados como o Prisma.
2.  **Ações de IA (`src/lib/ai/actions.ts`)**: Funções que atuam como uma ponte entre o frontend e os fluxos de IA definidos com o Genkit.

---

## 1. Ações de Dados (`src/lib/actions.ts`)

Estas funções gerenciam as operações de CRUD (Criar, Ler, Atualizar, Excluir) para as principais entidades do sistema.

### Funções de Usuário

#### `getAllUsers(): Promise<User[]>`
-   **Descrição**: Retorna uma lista de todos os usuários cadastrados no sistema.
-   **Parâmetros**: Nenhum.
-   **Retorno**: Uma `Promise` que resolve para um array de objetos `User`.

#### `getUserById(id: string): Promise<User | null>`
-   **Descrição**: Busca um usuário específico pelo seu ID.
-   **Parâmetros**:
    -   `id` (string): O ID único do usuário.
-   **Retorno**: Uma `Promise` que resolve para um objeto `User` se encontrado, ou `null` caso contrário.

#### `addUser(userData: UserCreation): Promise<User | null>`
-   **Descrição**: Adiciona um novo usuário ao sistema com o status "pendente".
-   **Parâmetros**:
    -   `userData` (UserCreation): Um objeto contendo os dados do novo usuário (nome, email, função, período de acesso, etc.).
-   **Retorno**: Uma `Promise` que resolve para o objeto `User` recém-criado.

#### `updateUser(userId: string, data: UserUpdate): Promise<User | null>`
-   **Descrição**: Atualiza os dados de um usuário existente.
-   **Parâmetros**:
    -   `userId` (string): O ID do usuário a ser atualizado.
    -   `data` (UserUpdate): Um objeto com os campos a serem atualizados.
-   **Retorno**: Uma `Promise` que resolve para o objeto `User` atualizado, ou `null` se o usuário não for encontrado.

#### `deleteUser(userId: string): Promise<boolean>`
-   **Descrição**: Remove permanentemente um usuário do sistema.
-   **Parâmetros**:
    -   `userId` (string): O ID do usuário a ser excluído.
-   **Retorno**: Uma `Promise` que resolve para `true` se a exclusão for bem-sucedida, ou `false` caso contrário.

#### `revokeUserAccess(userId: string): Promise<boolean>`
-   **Descrição**: Revoga o acesso de um usuário, alterando seu status para "expirado" e definindo a data final do acesso para o momento atual. **IMPORTANTE**: Se o usuário convidou outros usuários (hóspede com convidados), o acesso de todos os convidados também será revogado automaticamente.
-   **Parâmetros**:
    -   `userId` (string): O ID do usuário cujo acesso será revogado.
-   **Retorno**: Uma `Promise` que resolve para `true` se a operação for bem-sucedida.
-   **Comportamento Especial**: 
    -   Identifica convidados através do campo `invitedById`
    -   Revoga apenas convidados com status diferente de "expirado"
    -   Registra logs separados para o usuário principal e cada convidado
    -   Operação é atômica - falha completa se houver erro

### Funções de Log

#### `getAllLogs(): Promise<AccessLog[]>`
-   **Descrição**: Retorna todos os registros de auditoria, ordenados do mais recente para o mais antigo.
-   **Parâmetros**: Nenhum.
-   **Retorno**: Uma `Promise` que resolve para um array de objetos `AccessLog`.

#### `getLogsByUserId(userId: string): Promise<AccessLog[]>`
-   **Descrição**: Retorna todos os registros de auditoria para um usuário específico.
-   **Parâmetros**:
    -   `userId` (string): O ID do usuário.
-   **Retorno**: Uma `Promise` que resolve para um array de objetos `AccessLog` relacionados ao usuário.

#### `addLogEntry(logData: LogCreation): Promise<AccessLog | null>`
-   **Descrição**: Cria uma nova entrada no registro de auditoria.
-   **Parâmetros**:
    -   `logData` (LogCreation): Um objeto com os detalhes do log (ID do usuário, ação, detalhes).
-   **Retorno**: Uma `Promise` que resolve para o objeto `AccessLog` recém-criado.

---

## 2. Ações de IA (`src/lib/ai/actions.ts`)

#### `createTermsOfService(input: GenerateTermsOfServiceInput): Promise<{ success: boolean; terms?: string; error?: string }>`
-   **Descrição**: Invoca o fluxo de IA do Genkit para gerar um documento de Termos de Serviço com base nas informações fornecidas.
-   **Parâmetros**:
    -   `input` (GenerateTermsOfServiceInput): Um objeto com os seguintes campos:
        -   `serviceDescription` (string): Descrição do serviço.
        -   `liability` (string): Termos de responsabilidade.
        -   `dataUse` (string): Política de uso de dados.
-   **Retorno**: Uma `Promise` que resolve para um objeto com:
    -   `success` (boolean): `true` se a geração foi bem-sucedida.
    -   `terms` (string, opcional): O documento de termos de serviço gerado.
    -   `error` (string, opcional): Uma mensagem de erro, se houver falha.

---

## 3. Tipos de Dados Principais (`src/lib/types.ts`)

-   **`User`**: Representa um usuário do sistema.
-   **`AccessLog`**: Representa uma entrada no registro de auditoria.
-   **`Gate`**: Um tipo string literal para os portões (`'nicaragua' | 'belgica'`).
-   **`UserCreation`**: Tipo para a criação de um novo usuário (um subconjunto de `User`).
-   **`UserUpdate`**: Tipo para a atualização de um usuário (um `Partial` de `User`).
