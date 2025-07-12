'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GateIcon } from '@/components/gate-icon';
import { getUsers, getLogs } from '@/lib/data';
import type { User, AccessLog } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { AccessGateControl } from '@/components/access-gate-control';

export default function AccessPage() {
  const [cpf, setCpf] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Start with loading true
  const [userLogs, setUserLogs] = useState<AccessLog[]>([]);

  useEffect(() => {
    // Development bypass: Automatically log in as a default user
    const allUsers = getUsers();
    const defaultUser = allUsers.find(u => u.id === '2'); // Alice, a guest with access
    
    if (defaultUser) {
      setUser(defaultUser);
      const allLogs = getLogs();
      setUserLogs(allLogs.filter(log => log.user.id === defaultUser.id));
    } else {
        setError('Usuário de desenvolvimento padrão não encontrado.');
    }
    setLoading(false);
  }, []); // Empty dependency array ensures this runs only once on mount


  const handleLogout = () => {
      setUser(null);
      // In a real app, you would redirect or show the login form again.
      // For this bypass, we will just clear the state.
      // To log back in, the user would need to refresh the page.
      setError("Você saiu. Atualize a página para re-logar como usuário de desenvolvimento.");
  }


  if (loading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (user) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Acesso ao Portão</h1>
            <p className="text-muted-foreground">Bem-vindo(a), {user.name.split(' ')[0]}!</p>
        </div>
        <AccessGateControl accessibleGates={user.accessibleGates || []} />
        <Card>
            <CardHeader>
                <CardTitle>Seu Histórico de Acesso</CardTitle>
                <CardDescription>Seus acionamentos de portão mais recentes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ação</TableHead>
                            <TableHead>Detalhes</TableHead>
                            <TableHead className="text-right">Data e Hora</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userLogs.length > 0 ? userLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.details}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                            {format(log.timestamp, 'd MMM, yyyy, HH:mm', { locale: ptBR })}
                            </TableCell>
                        </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">Nenhum registro encontrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
         <div className="text-center">
             <Button variant="link" onClick={handleLogout}>Sair</Button>
         </div>
      </div>
    );
  }

  // Fallback in case user is not found or during logout
  return (
     <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <GateIcon className="mb-4 h-16 w-16 text-primary" />
        <h1 className="font-headline text-5xl font-bold text-primary">Acesso Direto</h1>
         {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Acesso Encerrado</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
         )}
        <div className="mt-4 text-center text-sm">
              É administrador?{' '}
              <Link href="/" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                Acesse o painel
              </Link>
        </div>
      </div>
    </div>
  );
}
