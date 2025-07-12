
'use client';

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
import { toast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

interface RevokeUserDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
}

export function RevokeUserDialog({ isOpen, setIsOpen, user }: RevokeUserDialogProps) {
  const handleRevoke = () => {
    // Lógica de revogação simulada
    toast({
      title: 'Acesso Revogado',
      description: `O acesso de ${user.name} foi revogado com sucesso.`,
    });
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revogar Acesso</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja revogar o acesso de{' '}
            <span className="font-semibold text-foreground">{user.name}</span>? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleRevoke}>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
