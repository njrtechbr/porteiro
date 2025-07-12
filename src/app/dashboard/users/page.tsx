import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import { getUsers } from '@/lib/data';
import type { User } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddUserDialog } from '@/components/add-user-dialog';

export default function UsersPage() {
  const users: User[] = getUsers();

  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'ativo':
        return 'default';
      case 'pendente':
        return 'secondary';
      case 'expirado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Gerenciamento de Usuários</CardTitle>
        <CardDescription>Gerencie todos os usuários e suas permissões de acesso.</CardDescription>
        <div className="flex justify-end">
           <AddUserDialog />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="hidden md:table-cell">Período de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.accessStart && user.accessEnd
                    ? `${format(user.accessStart, 'dd/MM/yyyy')} - ${format(user.accessEnd, 'dd/MM/yyyy')}`
                    : 'Permanente'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(user.status)} className="capitalize">{user.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 p-0 items-center justify-center rounded-md data-[state=open]:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Revogar Acesso</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>1-{users.length}</strong> de <strong>{users.length}</strong> usuários
        </div>
      </CardFooter>
    </Card>
  );
}
