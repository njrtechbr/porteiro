import { addDays, subDays } from 'date-fns';
import type { User, AccessLog } from './types';

const now = new Date();

const users: User[] = [
  {
    id: '1',
    name: 'Homeowner Admin',
    email: 'admin@gatekeeper.com',
    role: 'Admin',
    accessStart: null,
    accessEnd: null,
    avatar: 'https://placehold.co/100x100/34A049/ffffff.png?text=A',
    status: 'active',
  },
  {
    id: '2',
    name: 'Alice Johnson (Guest)',
    email: 'alice.j@example.com',
    role: 'Guest',
    accessStart: subDays(now, 2),
    accessEnd: addDays(now, 5),
    invites: 3,
    avatar: 'https://placehold.co/100x100.png',
    status: 'active',
  },
  {
    id: '3',
    name: 'Grandma Sue',
    email: 'sue@family.com',
    role: 'Family',
    accessStart: null,
    accessEnd: null,
    avatar: 'https://placehold.co/100x100.png',
    status: 'active',
  },
  {
    id: '4',
    name: 'Bob Smith (Invitee)',
    email: 'bob.smith@work.com',
    role: 'Invitee',
    accessStart: subDays(now, 2),
    accessEnd: addDays(now, 5),
    avatar: 'https://placehold.co/100x100.png',
    status: 'active',
  },
  {
    id: '5',
    name: 'Charlie Brown (Upcoming)',
    email: 'charlie@peanuts.com',
    role: 'Guest',
    accessStart: addDays(now, 7),
    accessEnd: addDays(now, 14),
    invites: 5,
    avatar: 'https://placehold.co/100x100.png',
    status: 'pending',
  },
  {
    id: '6',
    name: 'David Clark (Expired)',
    email: 'd.clark@past.com',
    role: 'Guest',
    accessStart: subDays(now, 20),
    accessEnd: subDays(now, 15),
    invites: 0,
    avatar: 'https://placehold.co/100x100.png',
    status: 'expired',
  },
];

const logs: AccessLog[] = [
  {
    id: 'log1',
    user: users[1],
    action: 'Gate Opened',
    timestamp: subDays(now, 1),
    details: 'Remote open via application',
  },
  {
    id: 'log2',
    user: users[0],
    action: 'Access Granted',
    timestamp: subDays(now, 2),
    details: 'Granted guest access to Alice Johnson',
  },
  {
    id: 'log3',
    user: users[2],
    action: 'Gate Opened',
    timestamp: subDays(now, 3),
    details: 'Remote open via application',
  },
    {
    id: 'log4',
    user: users[3],
    action: 'User Registered',
    timestamp: subDays(now, 4),
    details: 'Registered via invite from Alice Johnson',
  },
  {
    id: 'log5',
    user: users[0],
    action: 'Access Granted',
    timestamp: subDays(now, 6),
    details: 'Granted permanent access to Grandma Sue',
  },
  {
    id: 'log6',
    user: users[4],
    action: 'User Registered',
    timestamp: subDays(now, 7),
    details: 'Registered for upcoming stay',
  },
];


export const getUsers = () => users;
export const getLogs = () => logs;
