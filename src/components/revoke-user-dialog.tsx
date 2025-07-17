'use client';

import { useState, useEffect } from 'react';
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
import { getAllUsers } from '@/lib/actions';

interface RevokeUserDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
  onRevoke: (userId: string) => Promise<boolean>;
}

export function RevokeUserDialog({ isOpen, setIsOpen, user, onRevoke }: RevokeUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [invitedUsersCount, setInvitedUsersCount] = useState(0);

  useEffect(() => {
    async function checkInvitedUsers() {
      if (isOpen && user) {
        try {
          const allUsers = await getAllUsers();
          const invitedByUser = allUsers.filter(u => u.invitedById === user.id && u.status !== 'expirado');
          setInvitedUsersCount(invitedByUser.length);
        } catch (error) {
          console.error('Erro ao buscar convidados:', error);
          setInvitedUsersCount(0);
        }
      }
    }
    
    checkInvitedUsers();
  }, [isOpen, user]);

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
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza de que deseja revogar o acesso de{' '}
              <span className="font-semibold text-foreground">{user.name}</span>? Esta ação não pode ser
              desfeita. O status do usuário será alterado para 'expirado'.
            </p>
            {invitedUsersCount > 0 && (
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Atenção: Este usuário convidou {invitedUsersCount} pessoa{invitedUsersCount !== 1 ? 's' : ''} que também {invitedUsersCount !== 1 ? 'terão' : 'terá'} o acesso revogado automaticamente.
              </p>
            )}
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
