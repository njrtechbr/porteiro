'use server';

import type { UserCreation, UserUpdate, LogCreation, User, AccessLog } from './types';
import { prisma } from './db';
import { revalidatePath } from 'next/cache';
import { UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { isValidCPF } from '@/lib/utils';

// Mapeamento dos valores exibidos na interface para os enums do Prisma
const roleMap = {
  'Admin': 'Admin',
  'Família': 'Familia',
  'Hóspede': 'Hospede',
  'Convidado': 'Convidado'
} as const;

const statusMap = {
  'ativo': 'ativo',
  'pendente': 'pendente',
  'expirado': 'expirado'
} as const;

// --- User Actions ---

export async function getAllUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('[getAllUsers] Usuários retornados:', users);
    return users.map(user => ({
      ...user,
      accessibleGates: user.accessibleGates as any[]
    }));
  } catch (error) {
    console.error('[getAllUsers] Erro ao buscar usuários:', error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) return null;
    
    return {
      ...user,
      accessibleGates: user.accessibleGates as any[]
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// --- Security Validation ---

export interface AccessValidationResult {
  isValid: boolean;
  reason?: string;
  user?: User;
}

export async function validateUserAccess(userId: string, gateId?: string): Promise<AccessValidationResult> {
  try {
    console.log(`[validateUserAccess] Iniciando validação para usuário ${userId}, portão ${gateId}`);
    
    // 1. Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log(`[validateUserAccess] Usuário ${userId} não encontrado`);
      return {
        isValid: false,
        reason: 'Usuário não encontrado no sistema.'
      };
    }

    // 2. Verificar se o cadastro está finalizado
    if (!user.password) {
      console.log(`[validateUserAccess] Usuário ${userId} não finalizou o cadastro`);
      return {
        isValid: false,
        reason: 'Cadastro não finalizado. Complete seu cadastro antes de acessar.',
        user: {
          ...user,
          accessibleGates: user.accessibleGates as any[]
        }
      };
    }

    // 3. Verificar status do usuário
    if (user.status !== 'ativo') {
      console.log(`[validateUserAccess] Usuário ${userId} com status ${user.status}`);
      let reason = 'Acesso não autorizado.';
      
      switch (user.status) {
        case 'pendente':
          reason = 'Seu cadastro ainda está pendente. Complete o processo de cadastro.';
          break;
        case 'expirado':
          reason = 'Seu acesso expirou. Entre em contato com o administrador.';
          break;
      }
      
      return {
        isValid: false,
        reason,
        user: {
          ...user,
          accessibleGates: user.accessibleGates as any[]
        }
      };
    }

    // 4. Verificar período de acesso (se aplicável)
    const now = new Date();
    
    if (user.accessStart && user.accessEnd) {
      if (now < user.accessStart) {
        console.log(`[validateUserAccess] Usuário ${userId} tentando acessar antes do período permitido`);
        return {
          isValid: false,
          reason: `Seu acesso será liberado apenas de ${user.accessStart.toLocaleDateString('pt-BR')} até ${user.accessEnd.toLocaleDateString('pt-BR')}. Atual período ainda não iniciou.`,
          user: {
            ...user,
            accessibleGates: user.accessibleGates as any[]
          }
        };
      }
      
      if (now > user.accessEnd) {
        console.log(`[validateUserAccess] Usuário ${userId} tentando acessar após o período permitido`);
        console.log(`[validateUserAccess] Data atual: ${now.toISOString()}`);
        console.log(`[validateUserAccess] Período fim: ${user.accessEnd.toISOString()}`);
        console.log(`[validateUserAccess] Diferença em horas: ${(now.getTime() - user.accessEnd.getTime()) / (1000 * 60 * 60)}`);
        
        // Atualizar automaticamente o status para expirado
        await prisma.user.update({
          where: { id: userId },
          data: { status: 'expirado' }
        });
        
        const reason = `Seu período de acesso era de ${user.accessStart.toLocaleDateString('pt-BR')} até ${user.accessEnd.toLocaleDateString('pt-BR')} e expirou. Entre em contato com o administrador.`;
        console.log(`[validateUserAccess] Retornando erro: ${reason}`);
        
        return {
          isValid: false,
          reason: reason,
          user: {
            ...user,
            accessibleGates: user.accessibleGates as any[]
          }
        };
      }
    }

    // 5. Verificar se o usuário tem acesso ao portão específico (se fornecido)
    if (gateId) {
      const hasGateAccess = user.accessibleGates.includes(gateId);
      if (!hasGateAccess) {
        console.log(`[validateUserAccess] Usuário ${userId} não tem acesso ao portão ${gateId}`);
        return {
          isValid: false,
          reason: 'Você não tem permissão para acessar este portão.',
          user: {
            ...user,
            accessibleGates: user.accessibleGates as any[]
          }
        };
      }
    }

    // 6. Verificar se é um convidado e se o hóspede que o convidou ainda tem acesso válido
    if (user.role === 'Convidado' && user.invitedById) {
      const inviter = await prisma.user.findUnique({
        where: { id: user.invitedById }
      });
      
      if (!inviter) {
        console.log(`[validateUserAccess] Hóspede que convidou o usuário ${userId} não encontrado`);
        return {
          isValid: false,
          reason: 'O hóspede que te convidou não foi encontrado. Entre em contato com o administrador.',
          user: {
            ...user,
            accessibleGates: user.accessibleGates as any[]
          }
        };
      }
      
      if (inviter.status !== 'ativo') {
        console.log(`[validateUserAccess] Hóspede que convidou o usuário ${userId} está com status ${inviter.status}`);
        return {
          isValid: false,
          reason: 'O hóspede que te convidou não possui mais acesso ativo.',
          user: {
            ...user,
            accessibleGates: user.accessibleGates as any[]
          }
        };
      }
      
      // Verificar se o período de acesso do hóspede ainda é válido
      if (inviter.accessStart && inviter.accessEnd) {
        if (now < inviter.accessStart || now > inviter.accessEnd) {
          console.log(`[validateUserAccess] Período de acesso do hóspede que convidou o usuário ${userId} expirado`);
          return {
            isValid: false,
            reason: 'O período de acesso do hóspede que te convidou expirou.',
            user: {
              ...user,
              accessibleGates: user.accessibleGates as any[]
            }
          };
        }
      }
    }

    console.log(`[validateUserAccess] Validação bem-sucedida para usuário ${userId}`);
    return {
      isValid: true,
      user: {
        ...user,
        accessibleGates: user.accessibleGates as any[]
      }
    };

  } catch (error) {
    console.error(`[validateUserAccess] Erro na validação de acesso:`, error);
    return {
      isValid: false,
      reason: 'Erro interno do sistema. Tente novamente mais tarde.'
    };
  }
}

// Função para validação em tempo real - retorna dados atualizados do usuário
export async function validateUserAccessRealTime(userId: string): Promise<AccessValidationResult> {
  const validation = await validateUserAccess(userId);
  
  if (validation.isValid && validation.user) {
    // Revalidar os portões acessíveis baseado no status atual
    const updatedUser = validation.user;
    
    // Se o usuário ainda é válido, garantir que os portões acessíveis estão corretos
    if (updatedUser.accessibleGates.length === 0) {
      console.log(`[validateUserAccessRealTime] Usuário ${userId} não tem portões acessíveis`);
      return {
        isValid: false,
        reason: 'Você não tem permissão para acessar nenhum portão.',
        user: updatedUser
      };
    }
  }
  
  return validation;
}

// Função para registrar tentativa de acesso não autorizado
export async function logUnauthorizedAccess(userId: string, reason: string, gateId?: string): Promise<void> {
  try {
    const details = `Tentativa de acesso não autorizado${gateId ? ` ao portão ${gateId}` : ''}. Motivo: ${reason}`;
    
    await addLogEntry({
      userId,
      action: 'Acesso Negado',
      details
    });
  } catch (error) {
    console.error('[logUnauthorizedAccess] Erro ao registrar tentativa não autorizada:', error);
  }
}

// Função para reativar usuário
export async function reactivateUser(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    // Reativar o usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ativo'
      }
    });

    // Registrar a reativação
    await addLogEntry({
      userId: '1', // Admin user
      action: 'Usuário Reativado',
      details: `Usuário ${user.name} foi reativado pelo administrador.`,
    });

    revalidatePath('/dashboard/users');
    return true;
  } catch (error) {
    console.error('[reactivateUser] Erro ao reativar usuário:', error);
    return false;
  }
}

// Função para alterar senha do usuário
export async function changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    // Criptografar a nova senha
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Atualizar a senha
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });

    // Registrar a alteração de senha
    await addLogEntry({
      userId: '1', // Admin user
      action: 'Senha Alterada',
      details: `Senha do usuário ${user.name} foi alterada pelo administrador.`,
    });

    revalidatePath('/dashboard/users');
    return true;
  } catch (error) {
    console.error('[changeUserPassword] Erro ao alterar senha:', error);
    return false;
  }
}

export async function addUser(userData: UserCreation & { invitedById?: string }): Promise<User | null> {
  try {
    // Log dos dados recebidos
    console.log('[addUser] Dados recebidos para criação:', userData);
    
    // Validar CPF se fornecido
    if (userData.cpf && userData.cpf.trim() !== '' && !isValidCPF(userData.cpf)) {
      throw new Error('CPF fornecido é inválido.');
    }
    
    let accessStart = userData.accessStart;
    let accessEnd = userData.accessEnd;
    // Se foi convidado por alguém, copiar período de acesso se for hóspede
    if (userData.invitedById) {
      const inviter = await prisma.user.findUnique({ where: { id: userData.invitedById } });
      if (inviter && inviter.role === 'Hospede') {
        accessStart = inviter.accessStart;
        accessEnd = inviter.accessEnd;
      }
    }
    const dataToCreate = {
      name: userData.name,
      email: userData.email,
      cpf: userData.cpf || null,
      role: roleMap[userData.role as keyof typeof roleMap] as UserRole,
      accessStart,
      accessEnd,
      accessCode: userData.accessCode,
      invites: userData.invites,
      status: statusMap['pendente'] as UserStatus,
      accessibleGates: userData.accessibleGates as string[],
      invitedById: userData.invitedById || null,
    };
    console.log('[addUser] Dados enviados ao Prisma:', dataToCreate);
    const newUser = await prisma.user.create({
      data: dataToCreate
    });

    // Criar log de criação de usuário
    await addLogEntry({
      userId: userData.invitedById || '1', // Quem convidou, ou admin
      action: 'Usuário Adicionado',
      details: `Acesso de ${newUser.name} foi criado com status pendente.`,
    });

    revalidatePath('/dashboard/users');
    return {
      ...newUser,
      accessibleGates: newUser.accessibleGates as any[]
    };
  } catch (error) {
    console.error('[addUser] Erro ao adicionar usuário:', error);
    throw error;
  }
}

export async function updateUser(userId: string, data: UserUpdate): Promise<User | null> {
  try {
    const originalUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!originalUser) return null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: roleMap[data.role as keyof typeof roleMap] as UserRole }),
        ...(data.accessStart !== undefined && { accessStart: data.accessStart }),
        ...(data.accessEnd !== undefined && { accessEnd: data.accessEnd }),
        ...(data.accessCode && { accessCode: data.accessCode }),
        ...(data.invites !== undefined && { invites: data.invites }),
        ...(data.status && { status: statusMap[data.status as keyof typeof statusMap] as UserStatus }),
        ...(data.accessibleGates && { accessibleGates: data.accessibleGates as string[] })
      }
    });

    await addLogEntry({
      userId: '1', // Admin user
      action: 'Usuário Atualizado',
      details: `Dados de ${originalUser.name} foram atualizados.`,
    });

    revalidatePath('/dashboard/users');
    return {
      ...updatedUser,
      accessibleGates: updatedUser.accessibleGates as any[]
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    await prisma.user.delete({
      where: { id: userId }
    });

    await addLogEntry({
      userId: '1', // Admin user
      action: 'Usuário Excluído',
      details: `Usuário ${user.name} foi excluído.`,
    });

    revalidatePath('/dashboard/users');
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

export async function revokeUserAccess(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.expirado,
        accessEnd: new Date()
      }
    });

    await addLogEntry({
      userId: '1', // Admin User
      action: 'Acesso Revogado',
      details: `Acesso de ${user.name} foi revogado.`,
    });

    revalidatePath('/dashboard/users');
    return true;
  } catch (error) {
    console.error('Error revoking user access:', error);
    return false;
  }
}

// Atualiza usuário pelo código de convite (accessCode)
export async function updateUserByAccessCode(accessCode: string, data: { name: string; email: string; cpf: string; password: string }): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({ where: { accessCode } });
    if (!user) return null;
    
    // Validar CPF se fornecido
    if (data.cpf && !isValidCPF(data.cpf)) {
      throw new Error('CPF fornecido é inválido.');
    }
    
    // Criptografar a senha antes de salvar
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    const updatedUser = await prisma.user.update({
      where: { accessCode },
      data: {
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        password: hashedPassword,
        status: 'ativo',
      }
    });
    await addLogEntry({
      userId: updatedUser.id,
      action: 'Cadastro Finalizado',
      details: `Usuário ${updatedUser.name} completou o cadastro e está ativo.`,
    });
    revalidatePath('/dashboard/users');
    return {
      ...updatedUser,
      accessibleGates: updatedUser.accessibleGates as any[]
    };
  } catch (error) {
    console.error('[updateUserByAccessCode] Erro ao atualizar usuário:', error);
    throw error;
  }
}

// --- Log Actions ---

export async function getAllLogs(): Promise<AccessLog[]> {
  try {
    const logs = await prisma.accessLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return logs.map(log => ({
      ...log,
      user: {
        id: log.user.id,
        name: log.user.name,
        avatar: log.user.avatar || 'https://placehold.co/100x100.png'
      }
    }));
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
}

export async function getLogsByUserId(userId: string): Promise<AccessLog[]> {
  try {
    const logs = await prisma.accessLog.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return logs.map(log => ({
      ...log,
      user: {
        id: log.user.id,
        name: log.user.name,
        avatar: log.user.avatar || 'https://placehold.co/100x100.png'
      }
    }));
  } catch (error) {
    console.error('Error fetching user logs:', error);
    return [];
  }
}

export async function addLogEntry(logData: LogCreation): Promise<AccessLog | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: logData.userId },
      select: {
        id: true,
        name: true,
        avatar: true
      }
    });

    if (!user) return null;

    const newLog = await prisma.accessLog.create({
      data: {
        userId: logData.userId,
        action: logData.action,
        details: logData.details
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    revalidatePath('/dashboard/logs');
    revalidatePath('/access');
    
    return {
      ...newLog,
      user: {
        id: newLog.user.id,
        name: newLog.user.name,
        avatar: newLog.user.avatar || 'https://placehold.co/100x100.png'
      }
    };
  } catch (error) {
    console.error('Error adding log entry:', error);
    return null;
  }
}
