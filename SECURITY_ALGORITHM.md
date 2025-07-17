# Algoritmo de Segurança do Sistema Porteiro

## Visão Geral

Este documento detalha o algoritmo de segurança implementado no sistema Porteiro para garantir que apenas usuários autorizados possam acionar os portões. O sistema implementa múltiplas camadas de validação tanto no momento do acionamento quanto em tempo real.

## Componentes do Sistema de Segurança

### 1. Validação de Acesso Principal (`validateUserAccess`)

Esta função é o núcleo do sistema de segurança e executa as seguintes verificações:

#### 1.1 Verificação de Existência do Usuário
- Verifica se o usuário existe no banco de dados
- Retorna erro se o usuário não for encontrado

#### 1.2 Verificação de Cadastro Completo
- Verifica se o usuário possui senha cadastrada
- Usuários sem senha são considerados com cadastro incompleto
- Impede acesso até que o cadastro seja finalizado

#### 1.3 Verificação de Status do Usuário
- **Ativo**: Usuário pode prosseguir com outras verificações
- **Pendente**: Cadastro não finalizado, acesso negado
- **Expirado**: Acesso revogado, acesso negado

#### 1.4 Verificação de Período de Acesso
- Verifica se a data/hora atual está dentro do período permitido
- Para usuários com `accessStart` e `accessEnd`:
  - Antes do início: acesso negado
  - Após o fim: acesso negado e status automaticamente alterado para "expirado"
- Usuários sem período definido têm acesso permanente

#### 1.5 Verificação de Portão Específico
- Verifica se o usuário tem permissão para o portão solicitado
- Consulta o array `accessibleGates` do usuário
- Acesso negado se o portão não estiver na lista

#### 1.6 Verificação de Vínculos (Convidados)
- Para usuários com role "Convidado":
  - Verifica se o hóspede que o convidou ainda existe
  - Verifica se o hóspede que o convidou ainda está ativo
  - Verifica se o período de acesso do hóspede ainda é válido
- Acesso negado se qualquer verificação falhar

### 2. Validação em Tempo Real (`validateUserAccessRealTime`)

Esta função executa a validação principal e adiciona verificações extras:

#### 2.1 Validação de Portões Acessíveis
- Verifica se o usuário tem pelo menos um portão acessível
- Acesso negado se não houver portões disponíveis

#### 2.2 Atualização de Dados
- Retorna dados atualizados do usuário
- Permite sincronização em tempo real da interface

### 3. Endpoint de Validação (`/api/validate-access`)

#### 3.1 Validação de Parâmetros
- Verifica se o `userId` foi fornecido
- Retorna erro 400 se parâmetros obrigatórios estiverem ausentes

#### 3.2 Validação de Portão Específico
- Se `gateId` for fornecido, executa validação adicional
- Verifica permissão específica para o portão solicitado

#### 3.3 Códigos de Resposta
- **200**: Acesso autorizado
- **403**: Acesso negado (com motivo)
- **400**: Parâmetros inválidos
- **500**: Erro interno do servidor

## Fluxo de Acionamento de Portão

### 1. Validação Prévia
```
Usuário clica no botão → Validação via API → Autorização/Negação
```

### 2. Processo de Acionamento Autorizado
1. **Validação de Segurança**: Chamada para `/api/validate-access`
2. **Obtenção de Localização**: Requisito obrigatório de GPS
3. **Registro de Log**: Acionamento é registrado com localização
4. **Feedback ao Usuário**: Confirmação de sucesso

### 3. Processo de Acionamento Negado
1. **Registro de Tentativa**: Log da tentativa não autorizada
2. **Feedback ao Usuário**: Mensagem de erro específica
3. **Ação Corretiva**: Logout automático se acesso expirado

## Validação em Tempo Real

### 1. Verificação Periódica
- Executa validação a cada 30 segundos
- Verifica mudanças no status do usuário
- Atualiza interface automaticamente

### 2. Detecção de Mudanças
- Monitora alterações no status do usuário
- Detecta mudanças nos portões acessíveis
- Sincroniza dados em tempo real

### 3. Ações Automáticas
- Logout automático para usuários expirados
- Atualização da interface em tempo real
- Bloqueio preventivo de ações não autorizadas

## Componente de Status de Segurança

### 1. Indicadores Visuais
- **Verde**: Acesso ativo e válido
- **Vermelho**: Acesso expirado ou negado
- **Amarelo**: Cadastro pendente ou expirando
- **Azul**: Acesso futuro (ainda não iniciado)
- **Cinza**: Sem portões acessíveis

### 2. Informações Exibidas
- Status atual do usuário
- Período de validade do acesso
- Número de portões acessíveis
- Tempo restante até expiração

## Registro de Auditoria

### 1. Eventos Registrados
- Acionamentos autorizados de portão
- Tentativas de acesso não autorizadas
- Validações em tempo real falhadas
- Erros no processo de acionamento

### 2. Informações Capturadas
- ID do usuário
- Ação realizada
- Data/hora do evento
- Localização GPS (quando aplicável)
- Motivo da negação (se aplicável)

## Benefícios do Sistema

### 1. Segurança Multicamada
- Múltiplas verificações independentes
- Validação em tempo real
- Registro completo de auditoria

### 2. Experiência do Usuário
- Feedback imediato sobre status
- Mensagens de erro específicas
- Interface atualizada em tempo real

### 3. Administração
- Controle granular de permissões
- Logs detalhados para auditoria
- Detecção automática de anomalias

## Considerações de Implementação

### 1. Performance
- Validações otimizadas para baixa latência
- Cache de dados do usuário quando possível
- Verificações assíncronas para não bloquear UI

### 2. Confiabilidade
- Tratamento robusto de erros
- Fallbacks para falhas de rede
- Validação redundante em múltiplas camadas

### 3. Escalabilidade
- Algoritmo otimizado para múltiplos usuários
- Estrutura de dados eficiente
- Possibilidade de cache distribuído

Este algoritmo garante que apenas usuários devidamente autorizados e com permissões válidas possam acionar os portões, mantendo um alto nível de segurança e auditoria completa de todas as ações. 