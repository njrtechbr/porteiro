'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import { getAllUsers, updateUser, deleteUser, revokeUserAccess } from '@/lib/actions';
import type { User, UserUpdate } from '@/lib/types';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddUserDialog } from '@/components/add-user-dialog';
import { EditUserDialog } from '@/components/edit-user-dialog';
import { RevokeUserDialog } from '@/components/revoke-user-dialog';
import { DeleteUserDialog } from '@/components/delete-user-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar usuários.' });
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleRevoke = (user: User) => {
    setSelectedUser(user);
    setIsRevokeDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const onUserUpdate = async (userId: string, data: UserUpdate) => {
    const updatedUser = await updateUser(userId, data);
    if (updatedUser) {
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso.' });
      return true;
    }
    toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao atualizar usuário.' });
    return false;
  };

  const onUserRevoke = async (userId: string) => {
    const success = await revokeUserAccess(userId);
    if (success) {
      await fetchUsers(); // Re-fetch to show updated status
      toast({ title: 'Sucesso', description: 'Acesso do usuário revogado.' });
      return true;
    }
    toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao revogar acesso.' });
    return false;
  };

  const onUserDelete = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      setUsers(users.filter(u => u.id !== userId));
      toast({ variant: 'destructive', title: 'Sucesso', description: 'Usuário excluído.' });
      return true;
    }
    toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao excluir usuário.' });
    return false;
  };

  const onUserAdd = async () => {
    await fetchUsers();
    toast({ title: 'Sucesso', description: 'Usuário adicionado com sucesso.' });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Gerenciamento de Usuários</CardTitle>
          <CardDescription>Gerencie todos os usuários e suas permissões de acesso.</CardDescription>
          <div className="flex justify-end">
            <AddUserDialog onUserAdded={onUserAdd} />
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
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                   <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">{user.email}</div>
                        </div>
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
                          <DropdownMenuItem onClick={() => handleEdit(user)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRevoke(user)}>Revogar Acesso</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user)}>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            {!loading && <>Mostrando <strong>1-{users.length}</strong> de <strong>{users.length}</strong> usuários</>}
          </div>
        </CardFooter>
      </Card>
      
      {selectedUser && (
        <>
          <EditUserDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            user={selectedUser}
            onSave={onUserUpdate}
          />
          <RevokeUserDialog
            isOpen={isRevokeDialogOpen}
            setIsOpen={setIsRevokeDialogOpen}
            user={selectedUser}
            onRevoke={onUserRevoke}
          />
          <DeleteUserDialog
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            user={selectedUser}
            onDelete={onUserDelete}
          />
        </>
      )}
    </>
  );
}
