'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DoorOpen, Construction } from 'lucide-react';
import type { Gate, GateDetails } from '@/lib/types';

const GATE_CONFIG: Record<Gate, GateDetails> = {
  nicaragua: {
    id: 'nicaragua',
    name: 'Av. Nicarágua',
    icon: DoorOpen,
    description: 'Portão da frente. (No Google Maps: Av. Nova Zelândia)',
  },
  belgica: {
    id: 'belgica',
    name: 'Av. Bélgica',
    icon: Construction,
    description: 'Portão dos fundos.',
  },
};

interface AccessGateControlProps {
  accessibleGates: Gate[];
  loadingGate: Gate | null;
  onGateAction: (gate: Gate, gateDetails: GateDetails) => void;
}

export function AccessGateControl({ accessibleGates, loadingGate, onGateAction }: AccessGateControlProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Acionar Portões</CardTitle>
        <CardDescription>Toque para abrir os portões que você tem acesso.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {accessibleGates.length > 0 ? (
            accessibleGates.map((gateId) => {
              const gateDetails = GATE_CONFIG[gateId];
              const Icon = gateDetails.icon;
              return (
                <div key={gateId} className="flex flex-col">
                  <Button
                    size="lg"
                    className="h-20 text-lg"
                    onClick={() => onGateAction(gateId, gateDetails)}
                    disabled={!!loadingGate}
                  >
                    {loadingGate === gateId ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="mr-3 h-6 w-6" />
                    )}
                    {gateDetails.name}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2 text-center">{gateDetails.description}</p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground pt-4">
              Você não tem acesso a nenhum portão.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
