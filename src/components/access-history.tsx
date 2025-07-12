'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AccessLog } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Globe } from 'lucide-react';

interface AccessHistoryProps {
    logs: AccessLog[];
}

export function AccessHistory({ logs }: AccessHistoryProps) {
  const renderDetails = (details: string) => {
    const parts = details.split(' - GPS: ');
    const description = parts[0];
    const gps = parts[1];
    const googleMapsLink = gps ? `https://www.google.com/maps?q=${gps}` : null;

    return (
      <>
        <p>{description}</p>
        {googleMapsLink && (
          <a 
            href={googleMapsLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
          >
            <Globe className="h-3 w-3" />
            Ver no mapa
          </a>
        )}
      </>
    );
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Histórico de Acesso</CardTitle>
        <CardDescription>Seus acionamentos de portão mais recentes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead className="text-right">Data e Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <p className="font-medium">{log.action}</p>
                      <div className="text-sm text-muted-foreground">{renderDetails(log.details)}</div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                      {format(log.timestamp, 'd MMM, HH:mm', { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
