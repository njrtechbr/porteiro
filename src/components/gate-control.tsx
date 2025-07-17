'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getCurrentUserId, getCurrentUserRole } from '@/lib/jwt-utils';

type Gate = 'nicaragua' | 'belgica';

export function GateControl() {
  const [loadingGate, setLoadingGate] = useState<Gate | null>(null);

  const handleGateAction = async (gate: Gate, gateName: string) => {
    setLoadingGate(gate);

    try {
      // Verificar se é um admin autenticado
      const userId = getCurrentUserId();
      const userRole = getCurrentUserRole();
      
      if (!userId || userRole !== 'Admin') {
        throw new Error('Apenas administradores podem acionar o portão.');
      }
      
      // Simular acionamento do portão (aqui seria a integração real com Home Assistant)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Registrar o acionamento no log
      const { addLogEntry } = await import('@/lib/actions');
      await addLogEntry({
        userId: adminUserId,
        action: 'Portão Acionado',
        details: `Acionamento via Dashboard Admin (${gateName})`,
      });
      
      setLoadingGate(null);
      toast({
        title: 'Portão Acionado',
        description: `O portão da ${gateName} foi acionado com sucesso.`,
      });
    } catch (error) {
      setLoadingGate(null);
      toast({
        variant: 'destructive',
        title: 'Erro no Acionamento',
        description: (error as Error).message || 'Não foi possível acionar o portão.',
      });
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Acionar Portões</CardTitle>
        <CardDescription>Acione os portões da propriedade remotamente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleGateAction('nicaragua', 'Av. Nicarágua')}
              disabled={!!loadingGate}
            >
              {loadingGate === 'nicaragua' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Acionar Portão Av. Nicarágua
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Portão da frente. (No Google Maps: Av. Nova Zelândia)</p>
          </div>
          <div className="flex flex-col items-center">
            <Button
              className="w-full"
              size="lg"
              variant="secondary"
              onClick={() => handleGateAction('belgica', 'Av. Bélgica')}
              disabled={!!loadingGate}
            >
              {loadingGate === 'belgica' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Acionar Portão Av. Bélgica
            </Button>
             <p className="text-xs text-muted-foreground mt-2">Portão dos fundos.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
