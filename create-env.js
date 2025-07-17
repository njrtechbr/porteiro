// Script para criar arquivo .env
const fs = require('fs');

const envContent = `# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/porteiro_db?schema=public"

# JWT Secret for Authentication (CRITICAL FOR LOGIN TO WORK!)
JWT_SECRET="FmSwDnApPDfomEuy1qh2WH5EOobSXTavU3X2iLM3FK/6X4wmZwV9eHbEK6yoFRMDZSb1cOaBnTz/W6NGGrCERg=="

# Genkit AI
GOOGLE_GENAI_API_KEY="sua-chave-google-ai"

# Next.js
NEXTAUTH_SECRET="seu-secret-nextauth"
NEXTAUTH_URL="http://localhost:9002"

# Home Assistant (opcional)
HOME_ASSISTANT_URL="http://seu-home-assistant:8123"
HOME_ASSISTANT_TOKEN="seu-token-home-assistant"
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Arquivo .env criado com sucesso!');
  console.log('📋 Configurações incluídas:');
  console.log('   🔐 JWT_SECRET - Token de segurança configurado');
  console.log('   🗄️ DATABASE_URL - Configuração do banco');
  console.log('   🚀 NEXTAUTH_URL - URL da aplicação');
  console.log('');
  console.log('🎯 Próximos passos:');
  console.log('1. Execute: npm run dev');
  console.log('2. Acesse: http://localhost:9002/access');
  console.log('3. Faça login com: admin@admin.com / password');
  console.log('4. Ou use: teste@expirado.com / 123456');
} catch (error) {
  console.error('❌ Erro ao criar .env:', error);
} 