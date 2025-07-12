'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type Gate = 'nicaragua' | 'belgica';

export function GateControl() {
  const [loadingGate, setLoadingGate] = useState<Gate | null>(null);

  const handleGateAction = (gate: Gate, gateName: string) => {
    setLoadingGate(gate);

    setTimeout(() => {
      setLoadingGate(null);
      toast({
        title: 'Portão Acionado',
        description: `O portão da ${gateName} foi acionado com sucesso.`,
      });
    }, 1500);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Acionar Portões</CardTitle>
        <CardDescription>Acione os portões da propriedade remotamente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            size="lg"
            onClick={() => handleGateAction('nicaragua', 'Av. Nicarágua')}
            disabled={!!loadingGate}
          >
            {loadingGate === 'nicaragua' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Acionar Portão Av. Nicarágua
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => handleGateAction('belgica', 'Av. Bélgica')}
            disabled={!!loadingGate}
          >
             {loadingGate === 'belgica' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Acionar Portão Av. Bélgica
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
