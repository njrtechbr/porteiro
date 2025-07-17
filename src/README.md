# Porteiro - Sistema de Controle de Acesso Inteligente

`Porteiro` é uma aplicação web full-stack moderna construída com Next.js, projetada para gerenciar o acesso a propriedades para familiares, convidados e visitantes temporários (como hóspedes do Airbnb). Possui um painel administrativo seguro, uma interface simplificada para que os convidados operem os portões e está pronta para ser instalada como um PWA (Progressive Web App) em dispositivos móveis.

## Funcionalidades Principais

### Painel Administrativo (`/dashboard`)
- **Gerenciamento Completo de Usuários**: Adicione, edite e exclua usuários com controle de acesso granular.
- **Controle de Acesso por Período**: Defina datas de início e fim para o acesso de hóspedes ou conceda acesso permanente.
- **Permissões por Portão**: Atribua acesso a portões específicos para cada usuário.
- **Controle Remoto de Portões**: Acione os portões da propriedade diretamente do painel.
- **Registros de Auditoria**: Visualize um histórico completo de todas as atividades de acesso e ações administrativas.
- **Configurações Unificadas**: Uma página central para gerenciar as informações da propriedade, modelos de convite e a integração com o Home Assistant (URL e Chave de API).
- **Gerador de Termos de Serviço com IA**: Utilize o Genkit e a IA do Google para gerar documentos de Termos de Serviço personalizados.

### Interface de Convidado (`/access`)
- **Interface Simplificada**: Uma página focada em permitir que os usuários acionem os portões aos quais têm acesso.
- **Segurança com Geolocalização**: Requer permissão de geolocalização do navegador para registrar a localização no momento do acionamento do portão.
- **Histórico Pessoal**: Os usuários podem visualizar seu próprio histórico de acesso.
- **Pronto para PWA**: Pode ser "instalado" na tela inicial de dispositivos Android e iOS para uma experiência de aplicativo nativo.

### Fluxo de Cadastro de Convidado (`/register`)
- **Acesso via Convite**: A página de registro só pode ser acessada com um link de convite único e seguro, gerado pelo administrador.
- **Finalização de Cadastro**: O convidado preenche suas informações para ativar um perfil pré-cadastrado, em vez de criar uma conta do zero.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Inteligência Artificial**: [Genkit](https://firebase.google.com/docs/genkit) (com Google Gemini)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **PWA**: [@ducanh2912/next-pwa](https://www.npmjs.com/package/@ducanh2912/next-pwa)
- **Backend (Simulado)**: [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations), preparado para integração com Prisma + PostgreSQL.

## Estrutura do Projeto

Aqui está uma visão geral dos diretórios e arquivos mais importantes:

```
/
├── public/                   # Arquivos estáticos (imagens, manifest.json, ícones de PWA)
│
├── src/
│   ├── app/                  # Rotas principais da aplicação (App Router)
│   │   ├── dashboard/        # Rotas e layout do painel administrativo
│   │   ├── access/           # Página de acesso para convidados
│   │   ├── register/         # Página para finalizar cadastro de convidados
│   │   ├── page.tsx          # Página de login do administrador
│   │   └── layout.tsx        # Layout raiz
│   │
│   ├── components/           # Componentes React reutilizáveis
│   │   ├── ui/               # Componentes base do ShadCN UI
│   │   └── *.tsx             # Componentes específicos da aplicação
│   │
│   ├── lib/                  # Lógica principal, tipos e dados
│   │   ├── actions.ts        # Funções Server Actions (camada de serviço)
│   │   ├── data.ts           # Dados simulados (usuários, logs)
│   │   ├── types.ts          # Definições de tipos TypeScript
│   │   └── utils.ts          # Funções utilitárias (ex: cn)
│   │
│   ├── ai/                   # Lógica de Inteligência Artificial com Genkit
│   │   ├── flows/            # Definições dos fluxos de IA
│   │   └── genkit.ts         # Configuração do cliente Genkit
│   │
│   └── hooks/                # Hooks React personalizados
│
├── .env                      # Arquivo para variáveis de ambiente (chave de API)
│
└── README.md                 # Este arquivo :)
```

## Como Começar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação e Configuração

1.  **Clone o repositório**:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DO_DIRETORIO>
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente**:
    - Renomeie o arquivo `.env.example` para `.env` (se houver um) ou crie um novo.
    - Adicione sua chave de API do Google AI ao arquivo `.env`:
      ```
      GOOGLE_API_KEY="SUA_CHAVE_DE_API_AQUI"
      ```

### Executando a Aplicação

Para iniciar o servidor de desenvolvimento, execute:
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:3000`.

### Credenciais de Acesso (Simuladas)

- **Painel do Administrador**:
  - **URL**: `http://localhost:3000/`
  - **Email**: `admin@porteiro.com`
  - **Senha**: `password`

- **Acesso de Convidado**:
  - **URL**: `http://localhost:3000/access`
  - A página carrega automaticamente os dados do usuário "Alice Joana (Hóspede)" para fins de desenvolvimento.
  - No celular, acesse a URL, abra as opções do navegador e selecione "Adicionar à tela de início" ou "Instalar aplicativo" para testar a funcionalidade PWA.
```