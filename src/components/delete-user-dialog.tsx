
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
import { buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';

interface DeleteUserDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
}

export function DeleteUserDialog({ isOpen, setIsOpen, user }: DeleteUserDialogProps) {
  const handleDelete = () => {
    // Lógica de exclusão simulada
    toast({
      variant: 'destructive',
      title: 'Usuário Excluído',
      description: `${user.name} foi excluído permanentemente do sistema.`,
    });
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja excluir permanentemente o usuário{' '}
            <span className="font-semibold text-foreground">{user.name}</span>? Todos os seus dados
            serão removidos. Esta ação é irreversível.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'destructive' }))}
            onClick={handleDelete}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
