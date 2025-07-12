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
import type { User, UserUpdate } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, RefreshCw, Loader2 } from 'lucide-react';
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
  onSave: (userId: string, data: UserUpdate) => Promise<boolean>;
}

export function EditUserDialog({ isOpen, setIsOpen, user, onSave }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserUpdate>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        accessStart: user.accessStart,
        accessEnd: user.accessEnd,
        accessCode: user.accessCode,
        invites: user.invites,
      });
      setIsPermanent(!user.accessStart && !user.accessEnd);
    }
  }, [user]);

  const [date, setDate] = useState<DateRange | undefined>({
    from: user.accessStart || undefined,
    to: user.accessEnd || undefined,
  });
  const [isPermanent, setIsPermanent] = useState(!user.accessStart && !user.accessEnd);

  const generateNewAccessCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, accessCode: newCode }));
    toast({
      title: 'Novo Código Gerado',
      description: `O novo código de acesso é ${newCode}.`,
    });
  };

  const handlePermanentChange = (checked: boolean) => {
    setIsPermanent(checked);
    if (checked) {
      setDate(undefined);
      setFormData(prev => ({ ...prev, accessStart: null, accessEnd: null }));
    } else {
        const today = new Date();
        const nextWeek = new Date(today.setDate(today.getDate() + 7));
        setDate({ from: new Date(), to: nextWeek });
        setFormData(prev => ({...prev, accessStart: new Date(), accessEnd: nextWeek}));
    }
  };
  
  const handleDateChange = (newDate: DateRange | undefined) => {
      setDate(newDate);
      setFormData(prev => ({...prev, accessStart: newDate?.from || null, accessEnd: newDate?.to || null}));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: id === 'invites' ? parseInt(value) : value }));
  };

  const handleRoleChange = (value: User['role']) => {
    setFormData(prev => ({...prev, role: value}));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await onSave(user.id, formData);
    if (success) {
      setIsOpen(false);
    }
    setIsLoading(false);
  };

  if (!user) return null;

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
              <Input id="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" value={formData.email || ''} onChange={handleChange} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                    Função
                </Label>
                 <Select value={formData.role} onValueChange={handleRoleChange}>
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
                      onSelect={handleDateChange}
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
                    <Input id="accessCode" value={formData.accessCode || ''} onChange={handleChange} className="font-mono" />
                    <Button type="button" variant="outline" size="icon" onClick={generateNewAccessCode}>
                        <RefreshCw className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invites" className="text-right">
                Convites
                </Label>
                <Input id="invites" type="number" value={formData.invites || 0} onChange={handleChange} min="0" className="col-span-3" />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" form="editUserForm" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
