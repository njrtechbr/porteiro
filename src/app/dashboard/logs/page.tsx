import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getLogs } from '@/lib/data';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AccessLog } from '@/lib/types';

export default function LogsPage() {
  const logs: AccessLog[] = getLogs();

  const getActionVariant = (action: string) => {
    if (action.includes('Acionado')) return 'default';
    if (action.includes('Concedido')) return 'secondary';
    if (action.includes('Registrado')) return 'outline';
    return 'destructive';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Registros de Acesso</CardTitle>
        <CardDescription>Uma trilha de auditoria de todas as atividades de acesso e portão.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead className="hidden md:table-cell">Detalhes</TableHead>
              <TableHead className="text-right">Data e Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={log.user.avatar} alt={log.user.name} />
                      <AvatarFallback>{log.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{log.user.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getActionVariant(log.action)}>{log.action}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{log.details}</TableCell>
                <TableCell className="text-right text-muted-foreground">{format(log.timestamp, 'd MMM, yyyy, HH:mm', { locale: ptBR })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
