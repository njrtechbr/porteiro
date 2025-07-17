import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  // Permitir login por email OU CPF
  const { email, password, emailOrCpf } = req.body;
  const senha = password;
  const loginId = emailOrCpf || email;
  
  if (!loginId || !senha) {
    return res.status(400).json({ error: 'Email/CPF e senha são obrigatórios.' });
  }
  
  try {
    // Buscar usuário por email OU cpf
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { cpf: loginId }
        ]
      }
    });
    
    // Validar credenciais (usuário e senha) - sempre a mesma mensagem por segurança
    if (!user || !user.password || !bcrypt.compareSync(senha, user.password)) {
      // Log do erro real no servidor para debugging
      if (!user) {
        console.log(`[AUTH] Tentativa de login com email/CPF inexistente: ${loginId}`);
      } else if (!user.password) {
        console.log(`[AUTH] Usuário ${user.id} não possui senha configurada`);
      } else {
        console.log(`[AUTH] Senha incorreta para usuário ${user.id} (${user.email})`);
      }
      
      return res.status(401).json({ error: 'Email/CPF ou senha incorretos. Verifique suas credenciais e tente novamente.' });
    }
    
    // Gerar JWT token seguro
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expira em 24 horas
    );
    
    console.log(`[AUTH] Login bem-sucedido para usuário ${user.id} (${user.email})`);
    
    return res.status(200).json({ 
      token: token,
      userId: user.id // Manter por compatibilidade temporária
    });
  } catch (err) {
    console.error('[AUTH] Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
} 