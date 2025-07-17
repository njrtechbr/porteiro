// Funções utilitárias para gerenciar configurações do sistema

export interface Setting {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'json' | 'boolean' | 'number';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingInput {
  key: string;
  value: any;
  type?: 'string' | 'json' | 'boolean' | 'number';
  category?: string;
}

/**
 * Busca uma configuração específica por chave
 * @param key - Chave da configuração
 * @returns Promise<Setting | null>
 */
export async function getSetting(key: string): Promise<Setting | null> {
  try {
    const response = await fetch(`/api/settings?key=${encodeURIComponent(key)}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar configuração: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar configuração ${key}:`, error);
    return null;
  }
}

/**
 * Busca o valor de uma configuração específica
 * @param key - Chave da configuração
 * @param defaultValue - Valor padrão se a configuração não existir
 * @returns Promise<any>
 */
export async function getSettingValue<T = any>(key: string, defaultValue?: T): Promise<T> {
  const setting = await getSetting(key);
  return setting ? setting.value : defaultValue;
}

/**
 * Busca todas as configurações ou filtra por categoria
 * @param category - Categoria opcional para filtrar
 * @returns Promise<Setting[]>
 */
export async function getSettings(category?: string): Promise<Setting[]> {
  try {
    const url = category ? `/api/settings?category=${encodeURIComponent(category)}` : '/api/settings';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar configurações: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return [];
  }
}

/**
 * Salva ou atualiza uma configuração
 * @param setting - Dados da configuração
 * @returns Promise<Setting>
 */
export async function saveSetting(setting: SettingInput): Promise<Setting> {
  try {
    // Primeiro verifica se a configuração já existe
    const existingSetting = await getSetting(setting.key);
    
    const method = existingSetting ? 'PUT' : 'POST';
    const response = await fetch('/api/settings', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(setting),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro ao salvar configuração: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao salvar configuração ${setting.key}:`, error);
    throw error;
  }
}

/**
 * Deleta uma configuração
 * @param key - Chave da configuração a ser deletada
 * @returns Promise<boolean>
 */
export async function deleteSetting(key: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/settings?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar configuração: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao deletar configuração ${key}:`, error);
    return false;
  }
}

// Chaves de configuração pré-definidas
export const SETTING_KEYS = {
  // Propriedade
  PROPERTY_NAME: 'property.name',
  PROPERTY_ADDRESS: 'property.address',
  
  // Termo de uso
  TERMS_OF_SERVICE: 'general.terms_of_service',
  
  // Mensagem de boas-vindas
  WELCOME_MESSAGE: 'guest.welcome_message',
  
  // Home Assistant
  HOME_ASSISTANT_URL: 'integration.home_assistant.url',
  HOME_ASSISTANT_TOKEN: 'integration.home_assistant.token',
  
  // Entidades dos portões
  GATE_NICARAGUA_ENTITY: 'gates.nicaragua.entity',
  GATE_BELGICA_ENTITY: 'gates.belgica.entity',
} as const;

/**
 * Funções de conveniência para configurações comuns
 */
export const SettingsHelper = {
  // Propriedade
  async getPropertyName(): Promise<string> {
    return await getSettingValue(SETTING_KEYS.PROPERTY_NAME, 'Casa da Família Silva');
  },
  
  async setPropertyName(name: string): Promise<void> {
    await saveSetting({
      key: SETTING_KEYS.PROPERTY_NAME,
      value: name,
      type: 'string',
      category: 'property'
    });
  },
  
  async getPropertyAddress(): Promise<string> {
    return await getSettingValue(SETTING_KEYS.PROPERTY_ADDRESS, 'Av. Principal, 123, São Paulo, SP');
  },
  
  async setPropertyAddress(address: string): Promise<void> {
    await saveSetting({
      key: SETTING_KEYS.PROPERTY_ADDRESS,
      value: address,
      type: 'string',
      category: 'property'
    });
  },
  
  // Termo de uso
  async getTermsOfService(): Promise<string> {
    const defaultTerms = `TERMO DE USO - SISTEMA PORTEIRO

1. ACEITAÇÃO DOS TERMOS
Ao utilizar o sistema de acesso, você concorda com estes termos de uso.

2. USO AUTORIZADO
O acesso é pessoal e intransferível. É proibido compartilhar códigos de acesso.

3. RESPONSABILIDADES
O usuário é responsável por:
- Manter sigilo do código de acesso
- Usar o sistema conforme autorizado
- Comunicar problemas ao administrador

4. RESTRIÇÕES
É vedado:
- Tentar burlar o sistema de segurança
- Permitir acesso de terceiros não autorizados
- Usar o sistema fora do período autorizado

5. MONITORAMENTO
Todos os acessos são registrados para fins de segurança.

6. ALTERAÇÕES
Estes termos podem ser alterados a qualquer momento.

Última atualização: ${new Date().toLocaleDateString('pt-BR')}`;

    return await getSettingValue(SETTING_KEYS.TERMS_OF_SERVICE, defaultTerms);
  },
  
  async setTermsOfService(terms: string): Promise<void> {
    await saveSetting({
      key: SETTING_KEYS.TERMS_OF_SERVICE,
      value: terms,
      type: 'string',
      category: 'general'
    });
  },
  
  // Mensagem de boas-vindas
  async getWelcomeMessage(): Promise<string> {
    const defaultMessage = `Olá {NOME},

Você recebeu um convite de acesso para a nossa propriedade!

Para garantir sua entrada, por favor, complete seu cadastro no link abaixo:
{LINK_CADASTRO}

Seu código de acesso para os portões é: {CODIGO_ACESSO}
Portões liberados: {LISTA_PORTOES}

O seu acesso estará válido de {DATA_INICIO} até {DATA_FIM}.

Qualquer dúvida, estamos à disposição!`;

    return await getSettingValue(SETTING_KEYS.WELCOME_MESSAGE, defaultMessage);
  },
  
  async setWelcomeMessage(message: string): Promise<void> {
    await saveSetting({
      key: SETTING_KEYS.WELCOME_MESSAGE,
      value: message,
      type: 'string',
      category: 'guest'
    });
  },
  
  // Home Assistant
  async getHomeAssistantUrl(): Promise<string> {
    return await getSettingValue(SETTING_KEYS.HOME_ASSISTANT_URL, '');
  },
  
  async setHomeAssistantUrl(url: string): Promise<void> {
    await saveSetting({
      key: SETTING_KEYS.HOME_ASSISTANT_URL,
      value: url,
      type: 'string',
      category: 'integration'
    });
  },
  
  async getHomeAssistantToken(): Promise<string> {
    return await getSettingValue(SETTING_KEYS.HOME_ASSISTANT_TOKEN, '');
  },
  
  async setHomeAssistantToken(token: string): Promise<void> {
    await saveSetting({
      key: SETTING_KEYS.HOME_ASSISTANT_TOKEN,
      value: token,
      type: 'string',
      category: 'integration'
    });
  },
  
  // Entidades dos portões
  async getGateNicaraguaEntity(): Promise<string> {
    return await getSettingValue(SETTING_KEYS.GATE_NICARAGUA_ENTITY, '');
  },
  
  async setGateNicaraguaEntity(entity: string): Promise<void> {
    await saveSetting({
      key: SETTING_KEYS.GATE_NICARAGUA_ENTITY,
      value: entity,
      type: 'string',
      category: 'gates'
    });
  },
  
  async getGateBelgicaEntity(): Promise<string> {
    return await getSettingValue(SETTING_KEYS.GATE_BELGICA_ENTITY, '');
  },
  
  async setGateBelgicaEntity(entity: string): Promise<void> {
    await saveSetting({
      key: SETTING_KEYS.GATE_BELGICA_ENTITY,
      value: entity,
      type: 'string',
      category: 'gates'
    });
  },
}; 