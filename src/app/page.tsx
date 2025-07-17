'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { GateIcon } from '@/components/gate-icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@porteiro.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Buscar usuário no backend pelo email
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        // Salvar token JWT no localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('porteiro_session_token', data.token);
        }
        router.push('/dashboard');
      } else {
        setError(data.error || 'E-mail ou senha inválidos.');
        setLoading(false);
      }
    } catch (err) {
      setError('Erro ao autenticar.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <GateIcon className="mb-4 h-16 w-16 text-primary" />
          <h1 className="font-headline text-5xl font-bold text-primary">Porteiro</h1>
          <p className="mt-2 text-muted-foreground">Sistema de controle de acesso inteligente</p>
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Login do Admin</CardTitle>
            <CardDescription>Use suas credenciais para acessar o painel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Erro de Login</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@porteiro.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Não é admin?{' '}
                <Link href="/access" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  Acesso de convidado
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
