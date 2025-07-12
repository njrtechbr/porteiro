'use client';

import { useState, useEffect } from 'react';
import type { User, AccessLog, Gate, GateDetails } from '@/lib/types';
import { getUsers, getLogs } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { AccessGateControl } from '@/components/access-gate-control';
import { AccessHistory } from '@/components/access-history';
import { UserHeader } from '@/components/user-header';
import { toast } from '@/hooks/use-toast';

export default function AccessPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userLogs, setUserLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingGate, setLoadingGate] = useState<Gate | null>(null);

  useEffect(() => {
    // Development bypass: Automatically log in as a default user
    const allUsers = getUsers();
    const defaultUser = allUsers.find(u => u.id === '2'); // Alice, a guest with access
    
    if (defaultUser) {
      setUser(defaultUser);
      const allLogs = getLogs();
      setUserLogs(allLogs.filter(log => log.user.id === defaultUser.id));
    } else {
      setError('Usuário de desenvolvimento padrão não encontrado.');
    }
    setLoading(false);
  }, []);

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocalização não é suportada pelo seu navegador.'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
           switch(error.code) {
                case error.PERMISSION_DENIED:
                    reject(new Error("Você negou a permissão de localização."));
                    break;
                case error.POSITION_UNAVAILABLE:
                    reject(new Error("As informações de localização não estão disponíveis."));
                    break;
                case error.TIMEOUT:
                    reject(new Error("A solicitação de localização expirou."));
                    break;
                default:
                    reject(new Error("Ocorreu um erro desconhecido ao obter a localização."));
                    break;
            }
        }
      );
    });
  };

  const handleGateAction = async (gate: Gate, gateDetails: GateDetails) => {
    if (!user) return;
    setLoadingGate(gate);

    try {
      const location = await getLocation();
      const locationString = `GPS: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
      
      // Simulate network delay for gate action
      setTimeout(() => {
        const newLog: AccessLog = {
          id: `log${Date.now()}`,
          user: { id: user.id, name: user.name, avatar: user.avatar },
          action: 'Portão Aberto',
          timestamp: new Date(),
          details: `Acionamento via App (${gateDetails.name}) - ${locationString}`,
        };
        
        setUserLogs(prevLogs => [newLog, ...prevLogs]);
        
        toast({
          title: 'Portão Acionado',
          description: `O portão da ${gateDetails.name} foi acionado com sucesso.`,
        });
        setLoadingGate(null);
      }, 1000);

    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Falha na Localização',
        description: (error as Error).message || 'Não foi possível obter a sua localização para acionar o portão.',
      });
      setLoadingGate(null);
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    setError("Você saiu. Atualize a página para re-logar como usuário de desenvolvimento.");
  };

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
          <AccessGateControl 
            accessibleGates={user.accessibleGates || []}
            onGateAction={handleGateAction}
            loadingGate={loadingGate}
          />
          <AccessHistory logs={userLogs} />
        </main>
      </div>
    );
  }

  // Fallback in case user is not found or during logout
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      {error && (
        <Alert variant="destructive" className="max-w-sm w-full mb-4">
          <AlertTitle>Acesso Encerrado</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <p className="mb-4 text-muted-foreground">Ocorreu um problema ao carregar os dados.</p>
       <div className="text-center text-sm">
            É administrador?{' '}
            <Link href="/" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
              Acesse o painel
            </Link>
        </div>
    </div>
  );
}
