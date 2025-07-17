import { NextRequest, NextResponse } from 'next/server';
import { validateUserAccessRealTime } from '@/lib/actions';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

export async function POST(request: NextRequest) {
  try {
    // Tentar obter token do header Authorization ou do body
    const authHeader = request.headers.get('authorization');
    const { token, gateId, userId } = await request.json().catch(() => ({}));
    
    const sessionToken = authHeader?.replace('Bearer ', '') || token;
    
    // Se ainda recebemos userId diretamente (compatibilidade temporária)
    if (userId && !sessionToken) {
      console.log(`[API] AVISO: Usando autenticação insegura com userId direto para usuário ${userId}`);
      
      const validation = await validateUserAccessRealTime(userId);
      
      if (!validation.isValid) {
        console.log(`[API] Acesso negado para usuário ${userId}: ${validation.reason}`);
        return NextResponse.json({
          isValid: false,
          reason: validation.reason,
          user: validation.user
        }, { status: 403 });
      }
      
      // Se um portão específico foi fornecido, validar acesso a ele
      if (gateId && validation.user) {
        const hasGateAccess = validation.user.accessibleGates.includes(gateId);
        if (!hasGateAccess) {
          console.log(`[API] Usuário ${userId} não tem acesso ao portão ${gateId}`);
          return NextResponse.json({
            isValid: false,
            reason: 'Você não tem permissão para acessar este portão.',
            user: validation.user
          }, { status: 403 });
        }
      }
      
      console.log(`[API] Acesso autorizado para usuário ${userId} (modo compatibilidade)`);
      return NextResponse.json({
        isValid: true,
        user: validation.user
      });
    }
    
    // Autenticação segura com JWT
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

    const userIdFromToken = decoded.userId;
    console.log(`[API] Validando acesso para usuário ${userIdFromToken}, portão ${gateId}`);

    const validation = await validateUserAccessRealTime(userIdFromToken);

    if (!validation.isValid) {
      console.log(`[API] Acesso negado para usuário ${userIdFromToken}: ${validation.reason}`);
      return NextResponse.json({
        isValid: false,
        reason: validation.reason,
        user: validation.user
      }, { status: 403 });
    }

    // Se um portão específico foi fornecido, validar acesso a ele
    if (gateId && validation.user) {
      const hasGateAccess = validation.user.accessibleGates.includes(gateId);
      if (!hasGateAccess) {
        console.log(`[API] Usuário ${userIdFromToken} não tem acesso ao portão ${gateId}`);
        return NextResponse.json({
          isValid: false,
          reason: 'Você não tem permissão para acessar este portão.',
          user: validation.user
        }, { status: 403 });
      }
    }

    console.log(`[API] Acesso autorizado para usuário ${userIdFromToken}`);
    return NextResponse.json({
      isValid: true,
      user: validation.user
    });

  } catch (error) {
    console.error('[API] Erro na validação de acesso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 