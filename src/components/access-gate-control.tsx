'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Gate } from '@/lib/types';

type GateName = 'Av. Nicarágua' | 'Av. Bélgica';

export function AccessGateControl({ accessibleGates }: { accessibleGates: Gate[] }) {
  const [loadingGate, setLoadingGate] = useState<Gate | null>(null);

  const handleGateAction = (gate: Gate, gateName: GateName) => {
    setLoadingGate(gate);

    setTimeout(() => {
      setLoadingGate(null);
      toast({
        title: 'Portão Acionado',
        description: `O portão da ${gateName} foi acionado com sucesso.`,
      });
    }, 1500);
  };
  
  const hasNicaraguaAccess = accessibleGates.includes('nicaragua');
  const hasBelgicaAccess = accessibleGates.includes('belgica');

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Acionar Portões</CardTitle>
        <CardDescription>Acione os portões que você tem permissão.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hasNicaraguaAccess ? (
                <Button
                    size="lg"
                    onClick={() => handleGateAction('nicaragua', 'Av. Nicarágua')}
                    disabled={!!loadingGate}
                >
                    {loadingGate === 'nicaragua' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Portão Av. Nicarágua
                </Button>
            ) : null}
            {hasBelgicaAccess ? (
                <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => handleGateAction('belgica', 'Av. Bélgica')}
                    disabled={!!loadingGate}
                >
                    {loadingGate === 'belgica' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Portão Av. Bélgica
                </Button>
            ) : null}
        </div>
        {!hasNicaraguaAccess && !hasBelgicaAccess && (
            <p className="text-center text-muted-foreground pt-4">Você não tem acesso a nenhum portão.</p>
        )}
      </CardContent>
    </Card>
  );
}
