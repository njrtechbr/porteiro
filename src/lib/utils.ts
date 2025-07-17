import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Valida se um CPF está em formato correto
 * @param cpf - CPF para validar (pode conter pontos e hífen)
 * @returns boolean - true se válido, false se inválido
 */
export function isValidCPF(cpf: string): boolean {
  // Remove pontos e hífen
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder < 2 ? 0 : remainder;
  
  if (parseInt(cleanCPF.charAt(9)) !== digit1) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder < 2 ? 0 : remainder;
  
  if (parseInt(cleanCPF.charAt(10)) !== digit2) {
    return false;
  }
  
  return true;
}

/**
 * Formata um CPF adicionando pontos e hífen
 * @param cpf - CPF para formatar
 * @returns string - CPF formatado ou string original se inválido
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length === 11) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
}

/**
 * Remove formatação de CPF (pontos e hífen)
 * @param cpf - CPF formatado
 * @returns string - CPF apenas com números
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/[^\d]/g, '');
}

/**
 * Obtém o termo de uso configurado pelo administrador
 * @returns Promise<string> - O termo de uso salvo ou um termo padrão
 */
export async function getTermoUso(): Promise<string> {
  try {
    // Importar dinamicamente para evitar problemas de SSR
    const { SettingsHelper } = await import('./settings');
    return await SettingsHelper.getTermsOfService();
  } catch (error) {
    console.error('Erro ao carregar termo de uso:', error);
    
    // Termo padrão em caso de erro
    return `TERMO DE USO - SISTEMA PORTEIRO

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
  }
}
