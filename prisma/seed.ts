import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário administrador
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-user-id',
      name: 'Admin',
      email: 'admin@admin.com',
      cpf: '000.000.000-00',
      role: UserRole.Admin,
      accessStart: null,
      accessEnd: null,
      accessCode: randomUUID(),
      invites: 0,
      avatar: 'https://placehold.co/100x100.png',
      status: UserStatus.ativo,
      accessibleGates: ['nicaragua', 'belgica'],
      password: '$2b$10$DZgRZum8LEvFBsThVJJW0.jaTztQtAHEc1Jg8vH8WQi5iOzFULX6G'
    }
  });

  console.log('✅ Usuário administrador criado:', adminUser.name);

  // Criar usuário família
  const familyUser = await prisma.user.create({
    data: {
      name: 'Maria Silva',
      email: 'maria@familia.com',
      cpf: '987.654.321-01',
      role: UserRole.Familia,
      accessStart: null,
      accessEnd: null,
      accessCode: randomUUID(),
      invites: 5,
      avatar: 'https://placehold.co/100x100.png',
      status: UserStatus.ativo,
      accessibleGates: ['nicaragua', 'belgica']
    }
  });

  console.log('✅ Usuário família criado:', familyUser.name);

  // Criar hóspede com acesso ativo
  const guestUser = await prisma.user.create({
    data: {
      name: 'Pedro Santos',
      email: 'pedro@hospede.com',
      cpf: '456.789.123-45',
      role: UserRole.Hospede,
      accessStart: new Date('2025-01-01'),
      accessEnd: new Date('2025-12-31'),
      accessCode: randomUUID(),
      invites: 2,
      avatar: 'https://placehold.co/100x100.png',
      status: UserStatus.ativo,
      accessibleGates: ['nicaragua']
    }
  });

  console.log('✅ Usuário hóspede criado:', guestUser.name);

  // Criar convidado pendente
  const pendingUser = await prisma.user.create({
    data: {
      name: 'Ana Costa',
      email: 'ana@convidado.com',
      cpf: '789.123.456-78',
      role: UserRole.Convidado,
      accessStart: new Date('2025-01-15'),
      accessEnd: new Date('2025-01-20'),
      accessCode: randomUUID(),
      invites: 0,
      avatar: 'https://placehold.co/100x100.png',
      status: UserStatus.pendente,
      accessibleGates: ['nicaragua']
    }
  });

  console.log('✅ Usuário convidado pendente criado:', pendingUser.name);

  // Criar alguns logs de exemplo
  await prisma.accessLog.create({
    data: {
      userId: adminUser.id,
      action: 'Sistema Iniciado',
      details: 'Sistema Porteiro foi iniciado com sucesso'
    }
  });

  await prisma.accessLog.create({
    data: {
      userId: familyUser.id,
      action: 'Portão Acionado',
      details: 'Portão Nicarágua foi acionado via aplicativo'
    }
  });

  await prisma.accessLog.create({
    data: {
      userId: guestUser.id,
      action: 'Acesso Ativado',
      details: 'Acesso de hóspede foi ativado para o período de 2025'
    }
  });

  console.log('✅ Logs de exemplo criados');
  console.log('🎉 Seed do banco de dados concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 