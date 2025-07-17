// Script para configurar SQLite (mais simples que PostgreSQL)
const fs = require('fs');

const envContent = `# Database (SQLite - não precisa de instalação)
DATABASE_URL="file:./dev.db"

# JWT Secret for Authentication (CRITICAL FOR LOGIN TO WORK!)
JWT_SECRET="FmSwDnApPDfomEuy1qh2WH5EOobSXTavU3X2iLM3FK/6X4wmZwV9eHbEK6yoFRMDZSb1cOaBnTz/W6NGGrCERg=="

# Genkit AI
GOOGLE_GENAI_API_KEY="sua-chave-google-ai"

# Next.js
NEXTAUTH_SECRET="seu-secret-nextauth"
NEXTAUTH_URL="http://localhost:3000"

# Home Assistant (opcional)
HOME_ASSISTANT_URL="http://seu-home-assistant:8123"
HOME_ASSISTANT_TOKEN="seu-token-home-assistant"
`;

const prismaSchemaUpdate = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Resto do schema continua igual...
`;

try {
  // Atualizar .env
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env atualizado para SQLite!');
  
  console.log('🎯 Próximos passos:');
  console.log('1. Execute: npx prisma db push');
  console.log('2. Execute: npm run db:seed');
  console.log('3. Reinicie: npm run dev');
  console.log('4. Teste login: admin@admin.com / password');
  
} catch (error) {
  console.error('❌ Erro:', error);
} 