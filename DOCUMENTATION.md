# Documentação de Funcionamento do Sistema Porteiro

Este documento detalha o funcionamento do sistema de controle de acesso "Porteiro", descrevendo os fluxos de interação tanto para o administrador da propriedade quanto para os usuários (familiares, hóspedes e convidados).

## 1. Visão Geral

O "Porteiro" é uma aplicação web projetada para modernizar e simplificar o controle de acesso a uma propriedade. Ele centraliza o gerenciamento de permissões, oferece uma interface intuitiva para acionamento de portões e mantém um registro detalhado de todas as atividades.

O sistema é dividido em duas interfaces principais:
-   **Painel Administrativo (`/dashboard`)**: Uma área segura para o proprietário gerenciar usuários, permissões, configurações e monitorar a atividade.
-   **Interface de Acesso (`/access`)**: Uma página simplificada e otimizada para dispositivos móveis (PWA) onde os usuários podem acionar os portões aos quais têm permissão.

---

## 2. Fluxo do Administrador

O administrador tem controle total sobre o sistema através do painel.

### 2.1. Login
-   O acesso ao painel é protegido por um formulário de login em `http://<seu-dominio>/`.
-   As credenciais simuladas para desenvolvimento são:
    -   **Email**: `admin@porteiro.com`
    -   **Senha**: `password`

### 2.2. Painel Principal (`/dashboard`)
Após o login, o administrador é direcionado para o painel, que oferece:
-   **Acionamento Remoto**: Botões para acionar os portões principais diretamente.
-   **Listas de Acesso**: Resumos de usuários com acesso ativo e acessos futuros (agendados).
-   **Convites para Hóspedes**: Um cartão para gerar e compartilhar links de convite.

### 2.3. Gerenciamento de Usuários (`/dashboard/users`)
Esta é a área central para gerenciar quem pode acessar a propriedade.
-   **Visualização**: Uma tabela lista todos os usuários, com seus nomes, funções, status (ativo, pendente, expirado) e período de acesso.
-   **Adicionar Usuário**:
    1.  O admin clica em "Adicionar Usuário".
    2.  Preenche os dados do novo hóspede (nome, email), seleciona o período de acesso e define quais portões ele poderá acionar.
    3.  O sistema gera um **código de acesso único** e um **link de cadastro**.
    4.  O admin envia uma mensagem pré-formatada (via WhatsApp ou outro meio) contendo o link de cadastro para o hóspede. O usuário é criado com o status "pendente".
-   **Editar Usuário**: Permite alterar nome, email, período de acesso, função e portões permitidos.
-   **Revogar Acesso**: Altera o status do usuário para "expirado" imediatamente, bloqueando o acesso.
-   **Excluir Usuário**: Remove permanentemente o registro do usuário do sistema.

### 2.4. Registros de Auditoria (`/dashboard/logs`)
Uma trilha de auditoria completa:
-   Registra todas as ações importantes: acionamento de portões, concessão de acesso, atualizações de usuários, etc.
-   Mostra quem realizou a ação, quando e os detalhes relevantes (incluindo a localização GPS para acionamentos de portão).

### 2.5. Configurações (`/dashboard/settings`)
Uma página unificada para gerenciar as configurações do sistema:
-   **Geral**: Nome e endereço da propriedade.
-   **Acesso de Convidado**: Modelo da mensagem de boas-vindas enviada aos novos hóspedes.
-   **Integração Home Assistant**: Campo para inserir a URL da API e a chave de acesso (token) da instância do Home Assistant.
-   **Entidades dos Portões**: Campos para definir os IDs das entidades do Home Assistant correspondentes a cada portão (ex: `switch.portao_nicaragua`).

---

## 3. Fluxo do Convidado / Usuário

O fluxo para usuários (não administradores) é projetado para ser simples e direto.

### 3.1. Recebimento do Convite
-   O usuário recebe um link de convite do administrador (ex: via WhatsApp).
-   Este link contém um código único que o associa a um perfil pré-cadastrado como "pendente".

### 3.2. Finalização do Cadastro (`/register?code=...`)
-   Ao clicar no link, o usuário é levado a uma página para finalizar seu cadastro.
-   Ele preenche informações básicas (como CPF e senha) e aceita os Termos de Responsabilidade.
-   **Importante**: Ele não está criando uma conta nova, apenas ativando uma que já foi criada pelo admin.
-   Após a finalização, seu status muda de "pendente" para "ativo".

### 3.3. Acesso aos Portões (`/access`)
-   Após o cadastro, o usuário é redirecionado para a página `/access`. Este é o seu "aplicativo".
-   **PWA (Progressive Web App)**: O navegador no celular (Android e iOS) oferecerá a opção de "Adicionar à Tela de Início" ou "Instalar Aplicativo". Uma vez instalado, o "Porteiro" funcionará como um app nativo, abrindo diretamente na tela de acesso.
-   **Interface**: A tela exibe botões grandes e claros para cada portão ao qual o usuário tem acesso.
-   **Geolocalização**: Ao acionar um portão, o navegador solicita permissão de localização. Isso é um requisito de segurança para registrar de onde o portão foi aberto.
-   **Histórico Pessoal**: O usuário pode ver um histórico de seus próprios acessos na mesma tela.

Com isso, o sistema oferece uma solução completa, segura e fácil de usar tanto para quem gerencia quanto para quem acessa a propriedade.
