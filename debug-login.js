// Script para debugar problemas de login
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugLogin() {
  console.log('🔍 Debug do Sistema de Login\n');
  
  try {
    // 1. Verificar usuários no banco
    console.log('1️⃣ Verificando usuários no banco...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        role: true,
        status: true,
        password: true // Para verificar se existe
      }
    });
    
    console.log(`   📊 Total de usuários: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      🔑 Senha: ${user.password ? 'Configurada' : 'NÃO CONFIGURADA'}`);
      console.log(`      📊 Status: ${user.status}`);
      console.log(`      👤 Role: ${user.role}`);
      console.log('');
    });
    
    // 2. Verificar variáveis de ambiente
    console.log('2️⃣ Verificando configurações...');
    console.log(`   🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'Configurado' : '❌ NÃO CONFIGURADO'}`);
    console.log(`   🗄️ DATABASE_URL: ${process.env.DATABASE_URL ? 'Configurado' : '❌ NÃO CONFIGURADO'}`);
    
    // 3. Testar senha de um usuário conhecido
    console.log('\n3️⃣ Testando credenciais conhecidas...');
    const adminUser = users.find(u => u.email === 'admin@admin.com');
    if (adminUser) {
      console.log('   👤 Testando admin@admin.com / password');
      if (adminUser.password) {
        const isValidPassword = bcrypt.compareSync('password', adminUser.password);
        console.log(`   🔑 Senha válida: ${isValidPassword ? '✅ SIM' : '❌ NÃO'}`);
      } else {
        console.log('   🔑 Senha não configurada para este usuário');
      }
    } else {
      console.log('   ❌ Admin não encontrado');
    }
    
    // 4. Verificar usuário de teste
    const testUser = users.find(u => u.email === 'teste@expirado.com');
    if (testUser) {
      console.log('\n   👤 Testando teste@expirado.com / 123456');
      if (testUser.password) {
        const isValidPassword = bcrypt.compareSync('123456', testUser.password);
        console.log(`   🔑 Senha válida: ${isValidPassword ? '✅ SIM' : '❌ NÃO'}`);
      } else {
        console.log('   🔑 Senha não configurada para este usuário');
      }
    }
    
    console.log('\n💡 Problemas possíveis:');
    console.log('1. Arquivo .env não existe ou JWT_SECRET não configurado');
    console.log('2. Usuário não tem senha configurada');
    console.log('3. Senha incorreta');
    console.log('4. Problema de conexão com o banco');
    
  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin(); 