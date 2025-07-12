import type { LucideIcon } from "lucide-react";

export type Gate = 'nicaragua' | 'belgica';

export type GateDetails = {
    id: Gate;
    name: string;
    icon: LucideIcon;
};

export type User = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: 'Admin' | 'Família' | 'Hóspede' | 'Convidado';
  accessStart: Date | null;
  accessEnd: Date | null;
  accessCode: string;
  invites: number;
  avatar: string;
  status: 'ativo' | 'pendente' | 'expirado';
  accessibleGates: Gate[];
};

export type UserCreation = Omit<User, 'id' | 'avatar' | 'status'>;
export type UserUpdate = Partial<Omit<User, 'id' | 'avatar' | 'cpf'>>;


export type AccessLog = {
  id: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  action: string;
  timestamp: Date;
  details: string;
};

export type LogCreation = {
  userId: string;
  action: string;
  details: string;
}
