import type { LucideIcon } from "lucide-react";
import type { User as PrismaUser, AccessLog as PrismaAccessLog, UserRole, UserStatus } from '@prisma/client';

export type Gate = 'nicaragua' | 'belgica';

export type GateDetails = {
    id: Gate;
    name: string;
    icon: LucideIcon;
    description: string;
};

// Tipos baseados no Prisma
export type User = PrismaUser & {
  accessibleGates: Gate[];
};

export type UserCreation = Omit<User, 'id' | 'avatar' | 'status' | 'createdAt' | 'updatedAt'>;
export type UserUpdate = Partial<Omit<User, 'id' | 'avatar' | 'cpf' | 'createdAt' | 'updatedAt'>>;

export type AccessLog = PrismaAccessLog & {
  user: Pick<User, 'id' | 'name' | 'avatar'>;
};

export type LogCreation = {
  userId: string;
  action: string;
  details: string;
}

// Exportar os enums do Prisma
export { UserRole, UserStatus };

// Tipos para o frontend
export type UserWithLogs = User & {
  accessLogs: AccessLog[];
};
