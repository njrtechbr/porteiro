export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Family' | 'Guest' | 'Invitee';
  accessStart: Date | null;
  accessEnd: Date | null;
  invites?: number;
  avatar: string;
  status: 'active' | 'pending' | 'expired';
};

export type AccessLog = {
  id: string;
  user: Pick<User, 'name' | 'avatar'>;
  action: string;
  timestamp: Date;
  details: string;
};
