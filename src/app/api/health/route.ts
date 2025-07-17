import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Instância do Prisma
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Testar conexão com o banco de dados
    await prisma.$connect();
    
    // Executar query simples para verificar se está funcionando
    await prisma.$queryRaw`SELECT 1`;
    
    // Verificar se tabelas existem
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      users: userCount,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 