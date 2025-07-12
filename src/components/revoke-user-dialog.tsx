'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { User } from '@/lib/types';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface RevokeUserDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
  onRevoke: (userId: string) => Promise<boolean>;
}

export function RevokeUserDialog({ isOpen, setIsOpen, user, onRevoke }: RevokeUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRevoke = async () => {
    setIsLoading(true);
    const success = await onRevoke(user.id);
    if (success) {
      setIsOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revogar Acesso</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja revogar o acesso de{' '}
            <span className="font-semibold text-foreground">{user.name}</span>? Esta ação não pode ser
            desfeita. O status do usuário será alterado para 'expirado'.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleRevoke} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
