'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function GateControl() {
  const [gateStatus, setGateStatus] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [isLoading, setIsLoading] = useState(false);

  const handleGateAction = (action: 'open' | 'close') => {
    setIsLoading(true);
    setGateStatus(action === 'open' ? 'opening' : 'closing');

    setTimeout(() => {
      setGateStatus(action === 'open' ? 'open' : 'closed');
      setIsLoading(false);
      toast({
        title: `Gate ${action === 'open' ? 'Opened' : 'Closed'}`,
        description: `The main gate has been successfully ${action === 'open' ? 'opened' : 'closed'}.`,
      });
    }, 1500);
  };

  const getStatusInfo = () => {
    switch (gateStatus) {
      case 'open':
        return { text: 'Open', color: 'bg-green-500' };
      case 'closed':
        return { text: 'Closed', color: 'bg-red-500' };
      case 'opening':
        return { text: 'Opening...', color: 'bg-yellow-500 animate-pulse' };
      case 'closing':
        return { text: 'Closing...', color: 'bg-yellow-500 animate-pulse' };
    }
  };

  const { text, color } = getStatusInfo();

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Main Gate Control</CardTitle>
        <CardDescription>Remotely open or close the main property gate.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center rounded-lg bg-muted p-6">
          <div className="flex items-center gap-4">
            <span className="relative flex h-3 w-3">
              <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', color)}></span>
              <span className={cn('relative inline-flex h-3 w-3 rounded-full', color)}></span>
            </span>
            <p className="text-lg font-medium">
              Gate Status: <span className="font-bold text-primary">{text}</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            onClick={() => handleGateAction('open')}
            disabled={isLoading || gateStatus === 'open'}
          >
            Open Gate
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleGateAction('close')}
            disabled={isLoading || gateStatus === 'closed'}
          >
            Close Gate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
