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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

export function AddUserDialog() {
  const [userType, setUserType] = useState('guest');
  const [date, setDate] = useState<DateRange | undefined>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <UserPlus className="h-3.5 w-3.5" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Conceda acesso a uma nova pessoa. Escolha a função e defina a duração do acesso, se aplicável.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Função</Label>
            <RadioGroup defaultValue="guest" onValueChange={setUserType} className="col-span-3 flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="guest" id="r1" />
                <Label htmlFor="r1">Hóspede</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="family" id="r2" />
                <Label htmlFor="r2">Família</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" placeholder="João da Silva" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" placeholder="joao.silva@email.com" className="col-span-3" />
          </div>
          {userType === 'guest' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invites" className="text-right">
                  Convites
                </Label>
                <Input id="invites" type="number" defaultValue="5" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Datas de Acesso</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-[250px] justify-start text-left font-normal col-span-3',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y', { locale: ptBR })} - {format(date.to, 'LLL dd, y', { locale: ptBR })}
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
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="submit">Conceder Acesso</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
