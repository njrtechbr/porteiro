export type User = {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role: 'Admin' | 'Família' | 'Hóspede' | 'Convidado';
  accessStart: Date | null;
  accessEnd: Date | null;
  invites?: number;
  avatar: string;
  status: 'ativo' | 'pendente' | 'expirado';
};

export type AccessLog = {
  id: string;
  user: Pick<User, 'name' | 'avatar'>;
  action: string;
  timestamp: Date;
  details: string;
};
