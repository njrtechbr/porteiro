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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, UserPlus, Copy, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { Textarea } from './ui/textarea';
import { toast } from '@/hooks/use-toast';

export function AddUserDialog() {
  const [date, setDate] = useState<DateRange | undefined>();
  const [accessGranted, setAccessGranted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', accessCode: '', invites: '1' });
  
  const registrationLink = "https://porteiro.app/register?code=" + formData.accessCode;

  const whatsappMessage = `Olá ${formData.name},

Você recebeu um convite de acesso para a nossa propriedade!

Para garantir sua entrada, por favor, complete seu cadastro no link abaixo:
${registrationLink}

Seu código de acesso para os portões é: ${formData.accessCode}

O seu acesso estará válido de ${date?.from ? format(date.from, 'dd/MM/yyyy') : ''} até ${date?.to ? format(date.to, 'dd/MM/yyyy') : ''}.

Qualquer dúvida, estamos à disposição!`;

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const accessCode = (form.elements.namedItem('accessCode') as HTMLInputElement).value;
    const invites = (form.elements.namedItem('invites') as HTMLInputElement).value;

    if (name && email && accessCode && invites && date?.from && date?.to) {
        setFormData({ name, email, accessCode, invites });
        setAccessGranted(true);
    } else {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: "Por favor, preencha todos os campos e selecione um período de acesso.",
        })
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    toast({
      title: 'Mensagem Copiada!',
      description: 'O texto para o WhatsApp foi copiado para a área de transferência.',
    });
  };

  const resetState = () => {
    setAccessGranted(false);
    setFormData({ name: '', email: '', accessCode: '', invites: '1' });
    setDate(undefined);
  }

  return (
    <Dialog onOpenChange={(open) => !open && resetState()}>
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
                    <Input id="accessCode" name="accessCode" placeholder="ex: VISITA123" className="col-span-3" required/>
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
              </div>
            </form>
            <DialogFooter>
              <Button type="submit" form="addUserForm">Conceder Acesso</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline">Acesso Concedido!</DialogTitle>
              <DialogDescription>
                Envie esta mensagem para <span className="font-bold text-primary">{formData.name}</span> concluir o cadastro.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <Label htmlFor="whatsappMessage">Mensagem para WhatsApp</Label>
                <Textarea id="whatsappMessage" value={whatsappMessage} readOnly rows={12} className="text-sm" />
                <div className="flex gap-2 justify-end">
                    <Button variant="secondary" onClick={handleCopy}><Copy className="mr-2"/>Copiar Texto</Button>
                    <Button asChild>
                       <a href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
                          <Send className="mr-2"/>Enviar via WhatsApp
                        </a>
                    </Button>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" onClick={resetState}>Fechar</Button>
                </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
