import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GateIcon } from '@/components/gate-icon';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <GateIcon className="mb-4 h-16 w-16 text-primary" />
          <h1 className="font-headline text-5xl font-bold text-primary">Porteiro</h1>
          <p className="mt-2 text-muted-foreground">Controle de Acesso Inteligente e Seguro</p>
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Bem-vindo de volta</CardTitle>
            <CardDescription>Insira suas credenciais para acessar seu painel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@porteiro.com" defaultValue="admin@porteiro.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" defaultValue="password" required />
              </div>
              <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard">Entrar</Link>
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{' '}
              <Link href="/register" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
