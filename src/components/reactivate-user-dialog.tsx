'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { User } from '@/lib/types';
import { reactivateUser } from '@/lib/actions';
import { RotateCcw, Loader2 } from 'lucide-react';

interface ReactivateUserDialogProps {
  user: User;
  onUserReactivated: () => void;
}

export function ReactivateUserDialog({ user, onUserReactivated }: ReactivateUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      const success = await reactivateUser(user.id);
      if (success) {
        toast({
          title: 'Usuário Reativado',
          description: `${user.name} foi reativado com sucesso.`,
        });
        onUserReactivated();
        setIsOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível reativar o usuário.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro interno do servidor.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <RotateCcw className="h-3.5 w-3.5" />
          Reativar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reativar Usuário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja reativar o usuário <strong>{user.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Nome:</strong> {user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Status atual:</strong> {user.status}
            </p>
            {user.accessStart && user.accessEnd && (
              <p className="text-sm text-muted-foreground">
                <strong>Período:</strong> {user.accessStart.toLocaleDateString('pt-BR')} até {user.accessEnd.toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Reativar este usuário permitirá que ele tenha acesso novamente aos portões configurados, desde que esteja dentro do período de acesso válido.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleReactivate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reativar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 