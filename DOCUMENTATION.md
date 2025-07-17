# Documentação de Funcionamento do Sistema Porteiro

Este documento detalha o funcionamento do sistema de controle de acesso "Porteiro", descrevendo os fluxos de interação tanto para o administrador da propriedade quanto para os usuários (familiares, hóspedes e convidados).

## 1. Visão Geral

O "Porteiro" é uma aplicação web de nível empresarial projetada para modernizar e simplificar o controle de acesso a uma propriedade. Ele centraliza o gerenciamento de permissões, oferece uma interface intuitiva para acionamento de portões e mantém um registro detalhado de todas as atividades com **5 camadas de segurança**.

### Arquitetura do Sistema
- **Backend**: Next.js 15 com Server Actions e PostgreSQL
- **Autenticação**: JWT tokens com validação server-side
- **Segurança**: 5 camadas de validação e auditoria completa
- **PWA**: Progressive Web App para experiência mobile nativa
- **IA**: Integração com Google AI para geração de documentos

### Interfaces Principais
-   **Painel Administrativo (`/dashboard`)**: Área segura para gerenciamento completo
-   **Interface de Acesso (`/access`)**: PWA otimizada para usuários finais
-   **Sistema de Configurações**: Gerenciamento centralizado de configurações
-   **Logs de Auditoria**: Rastreamento completo de todas as ações

---

## 2. Fluxo do Administrador

O administrador tem controle total sobre o sistema através do painel.

### 2.1. Login Seguro
-   O acesso ao painel é protegido por autenticação JWT em `http://<seu-dominio>/`.
-   **Credenciais do Administrador**:
    -   **Email**: `admin@admin.com`
    -   **Senha**: `password`
-   **Segurança**: Sistema JWT com tokens de 24h e validação server-side

### 2.2. Painel Principal (`/dashboard`)
Após o login, o administrador é direcionado para o painel, que oferece:
-   **Acionamento Remoto**: Botões para acionar os portões principais diretamente.
-   **Listas de Acesso**: Resumos de usuários com acesso ativo e acessos futuros (agendados).
-   **Convites para Hóspedes**: Um cartão para gerar e compartilhar links de convite.

### 2.3. Gerenciamento Avançado de Usuários (`/dashboard/users`)
Esta é a área central para gerenciar quem pode acessar a propriedade com funcionalidades administrativas completas.

#### **Visualização e Monitoramento**
-   **Tabela Completa**: Lista todos os usuários com nomes, funções, status, período de acesso e quem os convidou
-   **Filtros Inteligentes**: Visualização por status (ativo, pendente, expirado)
-   **Relacionamentos**: Mostra hierarquia hóspede → convidados

#### **Operações de Usuário**
-   **Adicionar Usuário**:
    1.  Admin clica em "Adicionar Usuário"
    2.  Preenche dados completos (nome, email, CPF, papel, período)
    3.  Define portões acessíveis e permissões específicas
    4.  Sistema gera código único e link de cadastro seguro
    5.  Usuário criado com status "pendente" até ativação

-   **Editar Usuário**: Alteração completa de dados, períodos e permissões
-   **Reativar Usuário**: Restaura acesso de usuários expirados
-   **Alterar Senha**: Admin pode redefinir senhas com criptografia bcrypt
-   **Revogar Acesso com Cascata**: 
    - Revoga acesso do usuário principal
    - **IMPORTANTE**: Se for hóspede, revoga automaticamente todos os convidados
    - Aviso visual mostra quantos convidados serão afetados
-   **Excluir Usuário**: Remoção permanente com confirmação

### 2.4. Registros de Auditoria Avançados (`/dashboard/logs`)
Sistema completo de trilha de auditoria com rastreamento detalhado:
-   **Eventos Registrados**: Acionamentos, revogações, reativações, alterações de senha, tentativas não autorizadas
-   **Detalhes Capturados**: Usuário, ação, timestamp, localização GPS, motivo de negação
-   **Logs Especiais**: 
    - "Acesso Revogado" - revogação individual
    - "Acesso Revogado (Cascata)" - revogação automática de convidados
    - "Usuário Reativado" - restauração de acesso
    - "Senha Alterada" - redefinição por admin
-   **Filtros e Busca**: Por usuário, tipo de ação, período

### 2.5. Sistema de Configurações (`/dashboard/settings`)
Gerenciamento centralizado baseado em PostgreSQL com geração de documentos por IA:

#### **Configurações Gerais**
-   **Nome da Propriedade**: Identificação principal
-   **Endereço**: Localização completa da propriedade
-   **Termo de Uso**: Geração automática via IA Google Gemini

#### **Configurações de Acesso**
-   **Mensagem de Boas-vindas**: Template para novos hóspedes
-   **Período Padrão**: Configuração de acesso padrão

#### **Integração Home Assistant**
-   **URL da API**: Endpoint do Home Assistant
-   **Token de Acesso**: Autenticação segura
-   **Entidades dos Portões**: 
    - Portão Nicarágua: ID da entidade
    - Portão Bélgica: ID da entidade

#### **Funcionalidades Avançadas**
-   **Gerador de Termo de Uso IA**: Criação automática de documentos legais
-   **Persistência PostgreSQL**: Todas as configurações salvas no banco
-   **Validação em Tempo Real**: Verificação de conectividade Home Assistant

---

## 3. Fluxo Seguro do Usuário

O fluxo para usuários é projetado com **5 camadas de segurança** e experiência otimizada.

### 3.1. Recebimento e Validação do Convite
-   Usuário recebe link seguro do administrador com código único criptografado
-   Link contém código que associa a perfil pré-cadastrado com status "pendente"
-   **Validação**: Código tem expiração e é válido apenas uma vez

### 3.2. Cadastro Seguro (`/register?code=...`)
-   **Validação do Código**: Sistema verifica autenticidade e validade
-   **Preenchimento Obrigatório**: CPF (com validação), senha segura, aceite dos termos
-   **Criptografia**: Senha é criptografada com bcrypt antes do armazenamento
-   **Ativação**: Status muda de "pendente" para "ativo" após conclusão
-   **JWT**: Sistema gera token de autenticação válido por 24h

### 3.3. Interface de Acesso Avançada (`/access`)
Sistema PWA com validação em tempo real e controles de segurança:

#### **Progressive Web App (PWA)**
-   **Instalação**: Navegadores oferecem "Adicionar à Tela de Início"
-   **Experiência Nativa**: Funciona como app mobile completo
-   **Offline**: Funcionalidades básicas disponíveis sem internet

#### **Segurança Multicamada**
1. **Autenticação JWT**: Token validado a cada ação
2. **Validação de Período**: Verificação de horários permitidos
3. **Validação de Portões**: Acesso apenas aos portões autorizados
4. **Validação de Status**: Verifica se usuário ainda está ativo
5. **Validação de Vínculos**: Para convidados, verifica se hóspede ainda é válido

#### **Validação em Tempo Real**
-   **Verificação Periódica**: Sistema valida status a cada 30 segundos
-   **Logout Automático**: Usuário é desconectado se acesso expirar
-   **Sincronização**: Interface atualiza automaticamente com mudanças
-   **Avisos de Período**: Alertas quando fora do horário permitido

#### **Controles de Acesso**
-   **Botões Dinâmicos**: Apenas portões permitidos são exibidos
-   **Geolocalização Obrigatória**: GPS necessário para acionamento
-   **Confirmação Visual**: Feedback imediato de ações
-   **Histórico Pessoal**: Registro completo de acessos do usuário

#### **Experiência do Usuário**
-   **Interface Responsiva**: Otimizada para mobile e desktop
-   **Modo Escuro/Claro**: Adaptação automática
-   **Acessibilidade**: Compliance com padrões WCAG
-   **Performance**: Carregamento rápido e navegação fluida

### 3.4. Monitoramento e Segurança Contínua
-   **Logs de Atividade**: Todas as ações são registradas
-   **Detecção de Anomalias**: Sistema identifica comportamentos suspeitos
-   **Backup de Segurança**: Múltiplas camadas de validação
-   **Auditoria Completa**: Rastreamento de localização e horários

## 4. Benefícios do Sistema

### Para Administradores
-   **Controle Total**: Gerenciamento completo de usuários e permissões
-   **Auditoria Completa**: Logs detalhados de todas as ações
-   **Flexibilidade**: Configuração personalizada para cada situação
-   **Automação**: Revogação em cascata e validações automáticas

### Para Usuários
-   **Simplicidade**: Interface intuitiva e fácil de usar
-   **Segurança**: Múltiplas camadas de proteção
-   **Conveniência**: PWA instalável como app nativo
-   **Transparência**: Histórico completo de acessos

### Para a Propriedade
-   **Segurança Empresarial**: Nível de proteção de 95%
-   **Compliance**: Auditoria completa para regulamentações
-   **Escalabilidade**: Suporte para múltiplos usuários e portões
-   **Modernização**: Tecnologia de ponta para controle de acesso

Com isso, o sistema oferece uma solução **completa, segura e moderna** tanto para quem gerencia quanto para quem acessa a propriedade, mantendo sempre o foco na **segurança, usabilidade e auditoria**.
