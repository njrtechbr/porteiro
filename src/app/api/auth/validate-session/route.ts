import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccessRealTime } from '@/lib/actions';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

export async function POST(request: NextRequest) {
  try {
    // Tentar obter token do header Authorization ou do body
    const authHeader = request.headers.get('authorization');
    const { token } = await request.json().catch(() => ({}));
    
    const sessionToken = authHeader?.replace('Bearer ', '') || token;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Token de sessão não fornecido' },
        { status: 401 }
      );
    }

    // Verificar e decodificar o JWT
    let decoded;
    try {
      decoded = jwt.verify(sessionToken, JWT_SECRET) as any;
    } catch (jwtError) {
      console.log('[API] Token inválido ou expirado:', jwtError);
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    console.log(`[API] Validando sessão para usuário ${userId}`);

    // Validar acesso do usuário via API segura
    const validation = await validateUserAccessRealTime(userId);

    if (!validation.isValid) {
      console.log(`[API] Acesso negado para usuário ${userId}: ${validation.reason}`);
      return NextResponse.json({
        isValid: false,
        reason: validation.reason,
        user: null
      }, { status: 403 });
    }

    console.log(`[API] Sessão válida para usuário ${userId}`);
    return NextResponse.json({
      isValid: true,
      user: validation.user,
      userId: userId
    });

  } catch (error) {
    console.error('[API] Erro na validação de sessão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 