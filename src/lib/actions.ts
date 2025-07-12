'use server';

import type { UserCreation, UserUpdate, LogCreation, User, AccessLog } from './types';
import { users as staticUsers, logs as staticLogs } from './data';
import { revalidatePath } from 'next/cache';

// This file acts as a service layer. In the future, you can replace the logic
// inside these functions to use Prisma to interact with your PostgreSQL database
// without changing the component code.

// --- User Actions ---

export async function getAllUsers(): Promise<User[]> {
  // TODO: Replace with Prisma call: `await prisma.user.findMany()`
  return Promise.resolve(staticUsers);
}

export async function getUserById(id: string): Promise<User | null> {
  // TODO: Replace with Prisma call: `await prisma.user.findUnique({ where: { id } })`
  const user = staticUsers.find(u => u.id === id) || null;
  return Promise.resolve(user);
}

export async function addUser(userData: UserCreation): Promise<User | null> {
  // TODO: Replace with Prisma call: `await prisma.user.create({ data: ... })`
  const newUser: User = {
    id: `user${Date.now()}`,
    ...userData,
    avatar: 'https://placehold.co/100x100.png', // Default avatar
  };
  staticUsers.push(newUser);
  revalidatePath('/dashboard/users');
  return Promise.resolve(newUser);
}

export async function updateUser(userId: string, data: UserUpdate): Promise<User | null> {
  // TODO: Replace with Prisma call: `await prisma.user.update({ where: { id: userId }, data })`
  const userIndex = staticUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;

  const updatedUser = { ...staticUsers[userIndex], ...data };
  staticUsers[userIndex] = updatedUser;
  revalidatePath('/dashboard/users');
  revalidatePath(`/dashboard/users/${userId}`); // If you have a user details page
  return Promise.resolve(updatedUser);
}

export async function deleteUser(userId: string): Promise<boolean> {
  // TODO: Replace with Prisma call: `await prisma.user.delete({ where: { id: userId } })`
  const userIndex = staticUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) return false;

  staticUsers.splice(userIndex, 1);
  revalidatePath('/dashboard/users');
  return Promise.resolve(true);
}

export async function revokeUserAccess(userId: string): Promise<boolean> {
    // TODO: Replace with a more sophisticated Prisma update
    const userIndex = staticUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    staticUsers[userIndex].status = 'expirado';
    staticUsers[userIndex].accessEnd = new Date(); // Set access end to now
    revalidatePath('/dashboard/users');
    return Promise.resolve(true);
}


// --- Log Actions ---

export async function getAllLogs(): Promise<AccessLog[]> {
    // TODO: Replace with Prisma call: `await prisma.accessLog.findMany({ include: { user: true } })`
    const sortedLogs = staticLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return Promise.resolve(sortedLogs);
}

export async function getLogsByUserId(userId: string): Promise<AccessLog[]> {
    // TODO: Replace with Prisma call: `await prisma.accessLog.findMany({ where: { userId }, include: { user: true } })`
    const userLogs = staticLogs.filter(log => log.user.id === userId);
    const sortedLogs = userLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return Promise.resolve(sortedLogs);
}

export async function addLogEntry(logData: LogCreation): Promise<AccessLog | null> {
    // TODO: Replace with Prisma call: `await prisma.accessLog.create({ data: ... })`
    const user = staticUsers.find(u => u.id === logData.userId);
    if (!user) return null;

    const newLog: AccessLog = {
        id: `log${Date.now()}`,
        user: { id: user.id, name: user.name, avatar: user.avatar },
        action: logData.action,
        details: logData.details,
        timestamp: new Date(),
    };
    staticLogs.push(newLog);
    revalidatePath('/dashboard/logs');
    revalidatePath('/access'); // Revalidate access page for the user
    return Promise.resolve(newLog);
}

// --- AI Actions (already prepared) ---
export { createTermsOfService } from './ai/actions';
