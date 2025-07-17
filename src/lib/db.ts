import { PrismaClient } from '@prisma/client'

// Previne múltiplas instâncias do Prisma em desenvolvimento
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 