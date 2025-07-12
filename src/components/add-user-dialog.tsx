'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, UserPlus, Copy, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { Textarea } from './ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import type { Gate } from '@/lib/types';
import { addUser } from '@/lib/actions';

interface AddUserDialogProps {
  onUserAdded: () => void;
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();
  const [accessGranted, setAccessGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', invites: '1' });
  const [accessCode, setAccessCode] = useState('');
  const [accessibleGates, setAccessibleGates] = useState<Gate[]>([]);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);
  
  const registrationLink = accessCode ? `${origin}/register?code=${accessCode}`: '';

  const getGateNames = () => {
    if (accessibleGates.length === 2) return "Portões Av. Nicarágua e Av. Bélgica";
    if (accessibleGates.includes('nicaragua')) return "Portão Av. Nicarágua";
    if (accessibleGates.includes('belgica')) return "Portão Av. Bélgica";
    return "Nenhum portão";
  }

  const whatsappMessage = `Olá ${formData.name},

Você recebeu um convite de acesso para a nossa propriedade!

Para garantir sua entrada, por favor, complete seu cadastro no link abaixo:
${registrationLink}

Seu código de acesso para os portões é: ${accessCode}
Portões liberados: ${getGateNames()}

O seu acesso estará válido de ${date?.from ? format(date.from, 'dd/MM/yyyy') : ''} até ${date?.to ? format(date.to, 'dd/MM/yyyy') : ''}.

Qualquer dúvida, estamos à disposição!`;

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const invites = (form.elements.namedItem('invites') as HTMLInputElement).value;

    if (!name || !email || !invites || !date?.from || !date?.to || accessibleGates.length === 0) {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: "Por favor, preencha todos os campos, selecione um período e ao menos um portão de acesso.",
        });
        setIsLoading(false);
        return;
    }
    
    try {
      const newUser = await addUser({
        name,
        email,
        cpf: '', // CPF can be collected on registration
        role: 'Hóspede',
        accessStart: date.from,
        accessEnd: date.to,
        accessCode: accessCode,
        invites: parseInt(invites, 10),
        accessibleGates: accessibleGates,
        status: 'pendente'
      });
      if (newUser) {
        setFormData({ name, email, invites });
        setAccessGranted(true);
        onUserAdded();
      } else {
        throw new Error('Falha ao criar usuário.');
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Erro no Servidor",
        description: (error as Error).message || "Não foi possível adicionar o usuário.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    toast({
      title: 'Mensagem Copiada!',
      description: 'O texto para o WhatsApp foi copiado para a área de transferência.',
    });
  };
  
  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const handleGateChange = (gate: Gate, checked: boolean) => {
    setAccessibleGates(prev => 
      checked ? [...prev, gate] : prev.filter(g => g !== gate)
    );
  }

  const resetState = () => {
    setAccessGranted(false);
    setFormData({ name: '', email: '', invites: '1' });
    setDate(undefined);
    setAccessCode('');
    setAccessibleGates([]);
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setAccessCode(generateAccessCode());
    } else {
      resetState();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <UserPlus className="h-3.5 w-3.5" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        {!accessGranted ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline">Adicionar Novo Acesso</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para conceder acesso a um novo hóspede.
              </DialogDescription>
            </DialogHeader>
            <form id="addUserForm" onSubmit={handleGrantAccess}>
              <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                    Nome
                    </Label>
                    <Input id="name" name="name" placeholder="João da Silva" className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                    Email
                    </Label>
                    <Input id="email" name="email" type="email" placeholder="joao.silva@email.com" className="col-span-3" required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="accessCode" className="text-right">
                        Cód. de Acesso
                    </Label>
                    <Input id="accessCode" name="accessCode" value={accessCode} className="col-span-3 font-mono" readOnly/>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="invites" className="text-right">
                    Convites
                    </Label>
                    <Input id="invites" name="invites" type="number" defaultValue="1" min="0" className="col-span-3" required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Período</Label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="date"
                        variant={'outline'}
                        className={cn(
                            'w-full justify-start text-left font-normal col-span-3',
                            !date && 'text-muted-foreground'
                        )}
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
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Portões</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="gate-nicaragua" 
                        onCheckedChange={(checked) => handleGateChange('nicaragua', !!checked)}
                      />
                      <Label htmlFor="gate-nicaragua" className="font-normal">Av. Nicarágua</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="gate-belgica" 
                        onCheckedChange={(checked) => handleGateChange('belgica', !!checked)}
                      />
                      <Label htmlFor="gate-belgica" className="font-normal">Av. Bélgica</Label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="submit" form="addUserForm" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Conceder Acesso
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline">Acesso Concedido!</DialogTitle>
              <DialogDescription>
                Envie esta mensagem para <span className="font-bold text-primary">{formData.name}</span> para concluir o cadastro.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <Label htmlFor="whatsappMessage">Mensagem para WhatsApp</Label>
                <Textarea id="whatsappMessage" value={whatsappMessage} readOnly rows={12} className="text-sm" />
                <div className="flex gap-2 justify-end">
                    <Button variant="secondary" onClick={handleCopy}><Copy className="mr-2 h-4 w-4"/>Copiar Texto</Button>
                    <Button asChild>
                       <a href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
                          <Send className="mr-2 h-4 w-4"/>Enviar via WhatsApp
                        </a>
                    </Button>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Fechar</Button>
                </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
