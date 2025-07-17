// Utilitários para trabalhar com JWT tokens no cliente

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Limpa dados antigos do localStorage (para compatibilidade)
 */
export function cleanOldLocalStorageData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Remover ID do usuário antigo se existir
  const oldUserId = localStorage.getItem('porteiro_user_id');
  if (oldUserId) {
    console.log('[JWT-UTILS] Removendo porteiro_user_id antigo do localStorage');
    localStorage.removeItem('porteiro_user_id');
  }
}

/**
 * Obtém o token JWT do localStorage
 * @returns string | null
 */
export function getJWTToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('porteiro_session_token');
}

/**
 * Salva o token JWT no localStorage
 * @param token - Token JWT para salvar
 */
export function saveJWTToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem('porteiro_session_token', token);
}

/**
 * Remove o token JWT do localStorage
 */
export function removeJWTToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('porteiro_session_token');
}

/**
 * Decodifica um JWT token para obter o payload
 * @param token - Token JWT para decodificar
 * @returns JWTPayload | null
 */
export function decodeJWTToken(token: string): JWTPayload | null {
  try {
    // JWT tem 3 partes separadas por ponto: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decodificar o payload (segunda parte)
    const payload = parts[1];
    
    // Adicionar padding se necessário para base64
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decodificar de base64
    const decodedPayload = atob(paddedPayload);
    
    // Converter para objeto
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

/**
 * Obtém o payload do JWT token salvo no localStorage
 * @returns JWTPayload | null
 */
export function getCurrentJWTPayload(): JWTPayload | null {
  const token = getJWTToken();
  if (!token) {
    return null;
  }
  
  return decodeJWTToken(token);
}

/**
 * Obtém o ID do usuário atual do JWT
 * @returns string | null
 */
export function getCurrentUserId(): string | null {
  const payload = getCurrentJWTPayload();
  return payload?.userId || null;
}

/**
 * Obtém o email do usuário atual do JWT
 * @returns string | null
 */
export function getCurrentUserEmail(): string | null {
  const payload = getCurrentJWTPayload();
  return payload?.email || null;
}

/**
 * Obtém a role do usuário atual do JWT
 * @returns string | null
 */
export function getCurrentUserRole(): string | null {
  const payload = getCurrentJWTPayload();
  return payload?.role || null;
}

/**
 * Verifica se o token JWT está expirado
 * @returns boolean
 */
export function isJWTTokenExpired(): boolean {
  const payload = getCurrentJWTPayload();
  if (!payload) {
    return true;
  }
  
  // exp está em segundos, Date.now() está em milissegundos
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Verifica se há um usuário logado com token válido
 * @returns boolean
 */
export function isUserLoggedIn(): boolean {
  const token = getJWTToken();
  if (!token) {
    return false;
  }
  
  return !isJWTTokenExpired();
}

/**
 * Faz logout removendo o token e limpando dados antigos
 */
export function logout(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Remover token JWT
  localStorage.removeItem('porteiro_session_token');
  
  // Limpar dados antigos (para compatibilidade)
  localStorage.removeItem('porteiro_user_id');
}

/**
 * Inicializa as funções de JWT, fazendo limpeza automática
 * Deve ser chamada ao carregar a aplicação
 */
export function initializeJWTUtils(): void {
  cleanOldLocalStorageData();
} 