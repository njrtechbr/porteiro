import { addDays, subDays } from 'date-fns';
import type { User, AccessLog } from './types';

const now = new Date();

const users: User[] = [
  {
    id: '1',
    name: 'Admin da Casa',
    email: 'admin@porteiro.com',
    cpf: '111.111.111-11',
    role: 'Admin',
    accessStart: null,
    accessEnd: null,
    accessCode: 'ADMIN',
    avatar: 'https://placehold.co/100x100/34A049/ffffff.png?text=A',
    status: 'ativo',
    accessibleGates: ['nicaragua', 'belgica'],
  },
  {
    id: '2',
    name: 'Alice Joana (Hóspede)',
    email: 'alice.j@exemplo.com',
    cpf: '222.222.222-22',
    role: 'Hóspede',
    accessStart: subDays(now, 2),
    accessEnd: addDays(now, 5),
    accessCode: 'ALICE123',
    invites: 3,
    avatar: 'https://placehold.co/100x100.png',
    status: 'ativo',
    accessibleGates: ['nicaragua', 'belgica'],
  },
  {
    id: '3',
    name: 'Vovó Sônia',
    email: 'sonia@familia.com',
    cpf: '333.333.333-33',
    role: 'Família',
    accessStart: null,
    accessEnd: null,
    accessCode: 'SONIA123',
    avatar: 'https://placehold.co/100x100.png',
    status: 'ativo',
    accessibleGates: ['nicaragua'],
  },
  {
    id: '4',
    name: 'Beto Silva (Convidado)',
    email: 'beto.silva@trabalho.com',
    cpf: '444.444.444-44',
    role: 'Convidado',
    accessStart: subDays(now, 2),
    accessEnd: addDays(now, 5),
    accessCode: 'BETO123',
    avatar: 'https://placehold.co/100x100.png',
    status: 'ativo',
    accessibleGates: ['belgica'],
  },
  {
    id: '5',
    name: 'Carlos Dias (Próximo)',
    email: 'carlos@exemplo.com',
    cpf: '555.555.555-55',
    role: 'Hóspede',
    accessStart: addDays(now, 7),
    accessEnd: addDays(now, 14),
    accessCode: 'CARLOS123',
    invites: 5,
    avatar: 'https://placehold.co/100x100.png',
    status: 'pendente',
    accessibleGates: ['nicaragua', 'belgica'],
  },
  {
    id: '6',
    name: 'Davi Costa (Expirado)',
    email: 'd.costa@passado.com',
    cpf: '666.666.666-66',
    role: 'Hóspede',
    accessStart: subDays(now, 20),
    accessEnd: subDays(now, 15),
    accessCode: 'DAVI123',
    invites: 0,
    avatar: 'https://placehold.co/100x100.png',
    status: 'expirado',
    accessibleGates: [],
  },
];

const logs: AccessLog[] = [
  {
    id: 'log1',
    user: users[1],
    action: 'Portão Aberto',
    timestamp: subDays(now, 1),
    details: 'Acionamento via App (Av. Nicarágua) - GPS: -23.5505, -46.6333',
  },
  {
    id: 'log2',
    user: users[0],
    action: 'Acesso Concedido',
    timestamp: subDays(now, 2),
    details: 'Concedeu acesso de hóspede para Alice Joana',
  },
  {
    id: 'log3',
    user: users[2],
    action: 'Portão Aberto',
    timestamp: subDays(now, 3),
    details: 'Acionamento via App (Av. Nicarágua) - GPS: -23.5505, -46.6333',
  },
    {
    id: 'log4',
    user: users[3],
    action: 'Usuário Registrado',
    timestamp: subDays(now, 4),
    details: 'Registrado via convite de Alice Joana',
  },
  {
    id: 'log5',
    user: users[0],
    action: 'Acesso Concedido',
    timestamp: subDays(now, 6),
    details: 'Concedeu acesso permanente para Vovó Sônia',
  },
  {
    id: 'log6',
    user: users[4],
    action: 'Usuário Registrado',
    timestamp: subDays(now, 7),
    details: 'Registrado para estadia futura',
  },
  {
    id: 'log7',
    user: users[3],
    action: 'Portão Aberto',
    timestamp: subDays(now, 1),
    details: 'Acionamento via App (Av. Bélgica) - GPS: -23.5505, -46.6333',
  }
];


export const getUsers = () => users;
export const getLogs = () => logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
