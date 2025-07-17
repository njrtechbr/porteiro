import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { code } = req.query;
  console.log('[API] Código de convite recebido:', code);
  if (!code || typeof code !== 'string') {
    console.log('[API] Código ausente ou inválido');
    return res.status(400).json({ error: 'Código de convite ausente.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { accessCode: code } });
    console.log('[API] Resultado da busca por accessCode:', user);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    // Retorna apenas os dados necessários para o pré-preenchimento
    return res.status(200).json({
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      status: user.status,
      role: user.role
    });
  } catch (err) {
    console.error('[API] Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
} 