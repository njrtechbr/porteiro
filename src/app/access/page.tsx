'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User, AccessLog, Gate, GateDetails } from '@/lib/types';
import { getUserById, getLogsByUserId, addLogEntry, addUser, updateUser } from '@/lib/actions';
import { Loader2, Copy, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { AccessGateControl } from '@/components/access-gate-control';
import { AccessHistory } from '@/components/access-history';
import { UserHeader } from '@/components/user-header';
import { SecurityStatus } from '@/components/security-status';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { isValidCPF, formatCPF, cleanCPF } from '@/lib/utils';
import { GateIcon } from '@/components/gate-icon';
import { getJWTToken, saveJWTToken, logout } from '@/lib/jwt-utils';

export default function AccessPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userLogs, setUserLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingGate, setLoadingGate] = useState<Gate | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  // Estados para login de usuário comum
  const [loginId, setLoginId] = useState(''); // email ou cpf
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Estados para convite
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [canInvite, setCanInvite] = useState(true);
  const [inviteBlockReason, setInviteBlockReason] = useState('');
  
  // Estado para controle de período de acesso
  const [isOutOfPeriod, setIsOutOfPeriod] = useState(false);

  // Checar permissão de convite
  useEffect(() => {
    if (user) {
      if (user.role !== 'Hospede') {
        setCanInvite(false);
        setInviteBlockReason('Apenas hóspedes podem gerar convites.');
      } else if (user.invites <= 0) {
        setCanInvite(false);
        setInviteBlockReason('Você não possui convites disponíveis.');
      } else {
        setCanInvite(true);
        setInviteBlockReason('');
      }
    }
  }, [user]);

  // VALIDAÇÃO DE SEGURANÇA EM TEMPO REAL
  useEffect(() => {
    if (!user) return;
    
    const validateUserRealTime = async () => {
      try {
        setIsValidating(true);
        console.log(`[validateUserRealTime] Verificando acesso em tempo real...`);
        
        // Buscar token JWT
        const sessionToken = getJWTToken();
        
        if (!sessionToken) {
          console.log('[validateUserRealTime] Token não encontrado');
          setError('Sessão expirada. Faça login novamente.');
          setTimeout(() => {
            handleLogout();
          }, 3000);
          return;
        }
        
        // Validação via API usando token JWT
        const response = await fetch('/api/auth/validate-session', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ token: sessionToken })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.isValid) {
          console.log(`[validateUserRealTime] Acesso inválido: ${data.reason || data.error}`);
          
          // Mostrar alerta de acesso negado
          setError(data.reason || data.error || 'Seu acesso foi revogado.');
          
          // Se é erro de período, marcar como fora do período
          if (data.reason && data.reason.includes('período')) {
            setIsOutOfPeriod(true);
          }
          
          // Registrar tentativa não autorizada se ainda temos dados do usuário
          if (user?.id) {
            await addLogEntry({
              userId: user.id,
              action: 'Acesso Negado',
              details: `Validação em tempo real falhou. Motivo: ${data.reason || data.error}`,
            });
          }
          
          // Forçar logout após 3 segundos
          setTimeout(() => {
            handleLogout();
          }, 3000);
          
          return;
        }
        
        // Se o usuário ainda é válido, mas os dados mudaram, atualizar
        if (data.user) {
          const updatedUser = data.user;
          
          // Verificar se houve mudanças significativas
          if (
            updatedUser.status !== user.status ||
            updatedUser.accessibleGates.length !== user.accessibleGates.length ||
            JSON.stringify(updatedUser.accessibleGates) !== JSON.stringify(user.accessibleGates)
          ) {
            console.log(`[validateUserRealTime] Dados do usuário atualizados`);
            setUser(updatedUser);
          }
        }
        
      } catch (error) {
        console.error('[validateUserRealTime] Erro na validação:', error);
      } finally {
        setIsValidating(false);
      }
    };
    
    // Validar imediatamente
    validateUserRealTime();
    
    // Configurar validação periódica a cada 30 segundos
    const interval = setInterval(validateUserRealTime, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id, user?.status, user?.accessibleGates]);

  useEffect(() => {
    async function validateAndLoadUser() {
      setLoading(true);
      setError('');
      
      try {
        // Buscar token JWT
        const sessionToken = getJWTToken();
        
        if (!sessionToken) {
          console.log('[validateAndLoadUser] Nenhum token encontrado - mostrar login');
          setError(''); // Limpar erro para mostrar formulário de login
          setLoading(false);
          return;
        }

        // VALIDAÇÃO SEGURA VIA API - Não confia em dados locais
        console.log('[validateAndLoadUser] Validando sessão via API...');
        const response = await fetch('/api/auth/validate-session', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ token: sessionToken })
        });

        const data = await response.json();

        if (!response.ok || !data.isValid) {
          console.log('[validateAndLoadUser] Sessão inválida:', data.error || data.reason);
          
          // Se é um erro de período de acesso, mostrar a mensagem
          if (data.reason && data.reason.includes('período')) {
            setError(data.reason);
            setIsOutOfPeriod(true);
            setLoading(false);
            return;
          }
          
          // Para outros erros, limpar e permitir novo login
          setError('');
          setLoading(false);
          
          // Limpar token inválido
          logout();
          
          return;
        }

        // Usuário válido retornado pela API
        if (data.user) {
          console.log('[validateAndLoadUser] Usuário validado com sucesso:', data.user.name);
          setUser(data.user);
          
          // Carregar logs do usuário
          const fetchedLogs = await getLogsByUserId(data.userId);
          setUserLogs(fetchedLogs);
        } else {
          setError('Dados do usuário não encontrados.');
        }

      } catch (err) {
        console.error('[validateAndLoadUser] Erro na validação:', err);
        // Não definir erro - permitir mostrar formulário de login
        setError('');
      } finally {
        setLoading(false);
      }
    }

    validateAndLoadUser();
  }, [router]);

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    setLocationError(null);
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMessage = 'Geolocalização não é suportada pelo seu navegador.';
        setLocationError(errorMessage);
        return reject(new Error(errorMessage));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
           let errorMessage = "Ocorreu um erro desconhecido ao obter a localização.";
           switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Você negou a permissão de localização. Habilite-a para continuar.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "As informações de localização não estão disponíveis.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "A solicitação de localização expirou.";
                    break;
            }
            setLocationError(errorMessage);
            reject(new Error(errorMessage));
        }
      );
    });
  };

  const handleGateAction = async (gate: Gate, gateDetails: GateDetails) => {
    if (!user) return;
    setLoadingGate(gate);
    setLocationError(null);

    try {
      console.log(`[handleGateAction] Iniciando acionamento do portão ${gate}`);
      
      // Buscar token JWT para validação segura
      const sessionToken = getJWTToken();
      
      if (!sessionToken) {
        console.log('[handleGateAction] Token não encontrado');
        toast({
          variant: 'destructive',
          title: 'Sessão Expirada',
          description: 'Sua sessão expirou. Faça login novamente.',
        });
        setLoadingGate(null);
        setTimeout(() => {
          handleLogout();
        }, 2000);
        return;
      }
      
      // 1. VALIDAÇÃO DE SEGURANÇA VIA API COM TOKEN JWT
      const validationResponse = await fetch('/api/validate-access', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ 
          token: sessionToken,
          gateId: gate 
        })
      });
      
      const validationData = await validationResponse.json();
      
      if (!validationResponse.ok || !validationData.isValid) {
        console.log(`[handleGateAction] Acesso negado: ${validationData.reason || validationData.error}`);
        console.log(`[handleGateAction] Status da resposta: ${validationResponse.status}`);
        console.log(`[handleGateAction] Dados de validação:`, validationData);
        
        // Registrar tentativa não autorizada
        if (user?.id) {
          await addLogEntry({
            userId: user.id,
            action: 'Acesso Negado',
            details: `Tentativa de acionamento não autorizada do portão ${gateDetails.name}. Motivo: ${validationData.reason || validationData.error}`,
          });
        }
        
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: validationData.reason || validationData.error || 'Você não tem permissão para acionar este portão.',
        });
        
        setLoadingGate(null);
        
        // Se o usuário não tem mais acesso válido, forçar logout
        const reasonText = validationData.reason || validationData.error || '';
        const reasonLower = reasonText.toLowerCase();
        const shouldLogout = reasonLower.includes('expirou') || 
                           reasonLower.includes('pendente') || 
                           reasonLower.includes('período') ||
                           reasonLower.includes('acesso não autorizado') ||
                           reasonLower.includes('sessão') ||
                           validationResponse.status === 401 ||
                           validationResponse.status === 403;
        
        if (shouldLogout) {
          console.log(`[handleGateAction] Forçando logout devido a: ${reasonText}`);
          setTimeout(() => {
            handleLogout();
          }, 3000);
        }
        
        return;
      }
      
      console.log(`[handleGateAction] Validação de segurança aprovada`);
      
      // 2. OBTER LOCALIZAÇÃO (requisito de segurança)
      const location = await getLocation();
      const locationString = `GPS: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
      
      // 3. REGISTRAR ACIONAMENTO AUTORIZADO
      const details = `Acionamento via App (${gateDetails.name}) - ${locationString}`;
      
      const newLog = await addLogEntry({
        userId: user.id,
        action: 'Portão Acionado',
        details: details,
      });

      if (newLog) {
         setUserLogs(prevLogs => [newLog, ...prevLogs]);
         toast({
            title: 'Portão Acionado',
            description: `O portão da ${gateDetails.name} foi acionado com sucesso.`,
          });
         
         console.log(`[handleGateAction] Portão ${gate} acionado com sucesso`);
      } else {
        throw new Error("Falha ao registrar a ação.")
      }
      
      setLoadingGate(null);

    } catch (error) {
       console.error(`[handleGateAction] Erro no acionamento:`, error);
       
       // Registrar erro no log
       if (user?.id) {
         await addLogEntry({
           userId: user.id,
           action: 'Erro de Sistema',
           details: `Erro no acionamento do portão ${gateDetails.name}: ${(error as Error).message}`,
         });
       }
       
       toast({
         variant: 'destructive',
         title: 'Erro no Acionamento',
         description: (error as Error).message || 'Não foi possível acionar o portão.',
       });
       
       setLoadingGate(null);
    }
  };

  const handleRetryLocation = () => {
    getLocation().catch(err => {
        // Error is already handled inside getLocation and toast, just need to catch the promise rejection
        console.error("Tentativa de localização falhou novamente:", err.message);
    });
  };
  
  const handleLogout = () => {
    logout();
    setUser(null);
    setError(''); // Limpar erro para mostrar formulário de login
    setIsOutOfPeriod(false); // Reset do estado de período
    setLoading(false); // Garantir que não fica em loading
    // NÃO redirecionar - manter na página /access para novo login
  };

  // Função de login para usuário comum
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    
    // Validar se é um CPF e se está correto
    const isEmail = loginId.includes('@');
    if (!isEmail && loginId.length >= 11) {
      // É um CPF, vamos validar
      if (!isValidCPF(loginId)) {
        setLoginError('CPF inválido. Verifique os números digitados.');
        setLoginLoading(false);
        return;
      }
    }
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emailOrCpf: isEmail ? loginId : cleanCPF(loginId), 
          password: loginPassword 
        })
      });
      const data = await res.json();
      console.log('[LOGIN] Resposta do backend:', data);
      if (res.ok && data.token) {
        saveJWTToken(data.token);
        console.log('[LOGIN] Login bem-sucedido, recarregando página...');
        window.location.reload(); // recarrega a página para mostrar área de acesso
      } else {
        setLoginError(data.error || 'Credenciais inválidas.');
        console.log('[LOGIN] Credenciais incorretas:', data.error || 'Credenciais inválidas.');
      }
    } catch (err) {
      setLoginError('Erro ao autenticar.');
      console.error('[LOGIN] Erro inesperado:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  // Função para gerar convite
  const handleInvite = useCallback(async () => {
    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      // Gerar accessCode único
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      // Criar usuário pendente
      const newUser = await addUser({
        name: 'Novo Usuário',
        email: '',
        cpf: '',
        role: 'Convidado',
        accessStart: user?.accessStart || null,
        accessEnd: user?.accessEnd || null,
        accessCode: code,
        invites: 0,
        accessibleGates: [],
        invitedById: user?.id,
      });
      if (newUser) {
        // Decrementar o número de convites do hóspede
        await updateUser(user.id, { invites: user.invites - 1 });
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const link = `${origin}/register?code=${code}`;
        setInviteLink(link);
        setInviteSuccess('Convite gerado com sucesso!');
      } else {
        setInviteError('Erro ao gerar convite.');
      }
    } catch (err) {
      setInviteError('Erro ao gerar convite.');
    } finally {
      setInviteLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/40">
        <UserHeader user={user} onLogout={handleLogout} />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {locationError && (
             <Alert variant="destructive">
              <AlertTitle>Permissão de Localização Necessária</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span>{locationError}</span>
                <Button variant="secondary" size="sm" onClick={handleRetryLocation}>Tentar Novamente</Button>
              </AlertDescription>
            </Alert>
          )}
          <SecurityStatus user={user} isValidating={isValidating} />
          <AccessGateControl 
            accessibleGates={user.accessibleGates || []}
            onGateAction={handleGateAction}
            loadingGate={loadingGate}
          />
          <AccessHistory logs={userLogs} />
          {/* Cartão de convite só para hóspedes, no final da página */}
          {user.role === 'Hospede' && (
            <Card className="max-w-md mt-8 mx-auto">
              <CardHeader>
                <CardTitle>Convidar Novo Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm">Você tem <span className="font-bold text-primary">{user.invites}</span> convites disponíveis.</p>
                <Button onClick={handleInvite} disabled={inviteLoading || !canInvite} className="mb-2">
                  {inviteLoading ? 'Gerando...' : 'Gerar Convite'}
                </Button>
                {inviteBlockReason && <p className="text-yellow-600 text-sm mb-2">{inviteBlockReason}</p>}
                {inviteSuccess && <p className="text-green-600 text-sm mb-2">{inviteSuccess}</p>}
                {inviteError && <p className="text-red-600 text-sm mb-2">{inviteError}</p>}
                {inviteLink && (
                  <div className="flex items-center space-x-2">
                    <Input value={inviteLink} readOnly className="font-mono" />
                    <Button variant="outline" size="icon" onClick={() => {navigator.clipboard.writeText(inviteLink); toast({title: 'Link copiado!', description: 'O link de convite foi copiado para a área de transferência.'});}}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  // Fallback in case user is not found or during logout
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <GateIcon />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">
              {isOutOfPeriod ? 'Fora do Período de Acesso' : 'Erro de Acesso'}
            </CardTitle>
            <CardDescription className="text-red-600">
              {error}
            </CardDescription>
          </CardHeader>
          {isOutOfPeriod && (
            <CardContent className="space-y-4">
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Informação</AlertTitle>
                <AlertDescription>
                  Se você acredita que isso é um erro, entre em contato com o administrador do sistema.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={handleLogout}>
              Voltar ao Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      {error && (
        <Alert variant="destructive" className="max-w-sm w-full mb-4">
          <AlertTitle>Acesso Encerrado</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="max-w-sm w-full mb-4">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Acesso de Usuário</CardTitle>
          <CardDescription>Entre com seu email ou CPF e senha para acessar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="loginId"
                type="text"
                placeholder="Email ou CPF"
                required
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="loginPassword"
                type="password"
                placeholder="Senha"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
            </div>
            {loginError && (
              <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
