'use client';

import { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [userLogs, setUserLogs] = useState<AccessLog[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const allUsers = getUsers();
      const foundUser = allUsers.find(
        (u) => u.cpf === cpf && u.accessCode === accessCode && u.status === 'ativo'
      );

      if (foundUser) {
        setUser(foundUser);
        const allLogs = getLogs();
        setUserLogs(allLogs.filter(log => log.user.id === foundUser.id));
      } else {
        setError('CPF ou Código de Acesso inválido, ou seu acesso não está ativo.');
      }
      setLoading(false);
    }, 1000);
  };

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
             <Button variant="link" onClick={() => setUser(null)}>Sair</Button>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <GateIcon className="mb-4 h-16 w-16 text-primary" />
        <h1 className="font-headline text-5xl font-bold text-primary">Acesso Direto</h1>
        <p className="mt-2 text-muted-foreground">Use seu CPF e código para acionar o portão.</p>
      </div>
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Login de Acesso</CardTitle>
          <CardDescription>Insira seus dados para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Erro de Acesso</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-code">Código de Acesso</Label>
              <Input
                id="access-code"
                type="text"
                placeholder="Seu código"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
            <div className="mt-4 text-center text-sm">
              É administrador?{' '}
              <Link href="/" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                Acesse o painel
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
