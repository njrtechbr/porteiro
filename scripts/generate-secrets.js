#!/usr/bin/env node

const crypto = require('crypto');

/**
 * Gera secrets seguros para usar no arquivo .env de produção
 */

function generateJWTSecret() {
    // JWT Secret de 512-bit (64 bytes)
    return crypto.randomBytes(64).toString('hex');
}

function generateNextAuthSecret() {
    // NextAuth Secret base64
    return crypto.randomBytes(64).toString('base64');
}

function generateRandomPassword(length = 32) {
    // Senha aleatória com caracteres seguros
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

console.log('🔐 Gerando secrets seguros para produção...\n');

console.log('# ============================================');
console.log('# SECRETS GERADOS - COPIE PARA SEU .env');
console.log('# ============================================\n');

console.log('# JWT Secret (512-bit)');
console.log(`JWT_SECRET=${generateJWTSecret()}\n`);

console.log('# NextAuth Secret');
console.log(`NEXTAUTH_SECRET=${generateNextAuthSecret()}\n`);

console.log('# Senha do PostgreSQL');
console.log(`POSTGRES_PASSWORD=${generateRandomPassword(24)}\n`);

console.log('# Senha do Redis');
console.log(`REDIS_PASSWORD=${generateRandomPassword(24)}\n`);

console.log('# ============================================');
console.log('# IMPORTANTE:');
console.log('# 1. Salve esses valores em local seguro');
console.log('# 2. NUNCA compartilhe essas chaves');
console.log('# 3. Use valores diferentes para cada ambiente');
console.log('# ============================================'); 