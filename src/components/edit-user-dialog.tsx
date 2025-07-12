
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface EditUserDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
}

export function EditUserDialog({ isOpen, setIsOpen, user }: EditUserDialogProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [date, setDate] = useState<DateRange | undefined>({
    from: user.accessStart || undefined,
    to: user.accessEnd || undefined,
  });
  const [isPermanent, setIsPermanent] = useState(!user.accessStart && !user.accessEnd);
  const [accessCode, setAccessCode] = useState(user.accessCode || '');
  const [invites, setInvites] = useState(user.invites?.toString() || '0');

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setDate({ from: user.accessStart || undefined, to: user.accessEnd || undefined });
      setIsPermanent(!user.accessStart && !user.accessEnd);
      setAccessCode(user.accessCode || '');
      setInvites(user.invites?.toString() || '0');
    }
  }, [isOpen, user]);

  const generateNewAccessCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setAccessCode(newCode);
    toast({
      title: 'Novo Código Gerado',
      description: `O novo código de acesso é ${newCode}.`,
    });
  };

  const handlePermanentChange = (checked: boolean) => {
    setIsPermanent(checked);
    if (checked) {
      setDate(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de salvamento simulada
    console.log({
      name,
      email,
      role,
      date,
      isPermanent,
      accessCode,
      invites
    });
    toast({
      title: 'Usuário Atualizado',
      description: `As informações de ${name} foram salvas.`,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Faça alterações nas informações de <span className="font-bold">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <form id="editUserForm" onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                    Função
                </Label>
                 <Select value={role} onValueChange={(value) => setRole(value as User['role'])}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Hóspede">Hóspede</SelectItem>
                        <SelectItem value="Família">Família</SelectItem>
                        <SelectItem value="Convidado">Convidado</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Período</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                      disabled={isPermanent}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'dd/MM/yy')} - {format(date.to, 'dd/MM/yy')}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y', { locale: ptBR })
                        )
                      ) : (
                        <span>Escolha um período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div/>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox id="permanent" checked={isPermanent} onCheckedChange={handlePermanentChange} />
                <Label htmlFor="permanent" className="font-normal">Acesso Permanente</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="accessCode" className="text-right">
                    Cód. Acesso
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                    <Input id="accessCode" value={accessCode} onChange={e => setAccessCode(e.target.value)} className="font-mono" />
                    <Button type="button" variant="outline" size="icon" onClick={generateNewAccessCode}>
                        <RefreshCw className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invites" className="text-right">
                Convites
                </Label>
                <Input id="invites" type="number" value={invites} onChange={e => setInvites(e.target.value)} min="0" className="col-span-3" />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button type="submit" form="editUserForm">Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
