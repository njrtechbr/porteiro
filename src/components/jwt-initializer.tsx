'use client';

import { useEffect } from 'react';
import { initializeJWTUtils } from '@/lib/jwt-utils';

/**
 * Componente responsável por inicializar as funções JWT
 * e limpar dados antigos do localStorage
 */
export function JWTInitializer() {
  useEffect(() => {
    initializeJWTUtils();
  }, []);

  return null; // Componente invisível
} 