'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GateIcon } from '@/components/gate-icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const termsOfService = `
Última atualização: [Data]

Por favor, leia estes termos e condições cuidadosamente antes de usar Nosso Serviço.

Interpretação e Definições
==============================
Interpretação
--------------
As palavras cuja letra inicial é maiúscula têm significados definidos sob as seguintes condições. As seguintes definições terão o mesmo significado, independentemente de aparecerem no singular ou no plural.

Definições
-----------
Para os fins destes Termos e Condições:
*   Você significa o indivíduo que acessa ou usa o Serviço, ou a empresa, ou outra entidade legal em nome da qual tal indivíduo está acessando ou usando o Serviço, conforme aplicável.
*   Empresa (referida como "a Empresa", "Nós" ou "Nosso" neste Contrato) refere-se ao Porteiro.
*   Serviço refere-se à aplicação Porteiro.
*   Termos e Condições (também referidos como "Termos") significam estes Termos e Condições que formam o acordo integral entre Você e a Empresa em relação ao uso do Serviço.

Reconhecimento
==============
Estes são os Termos e Condições que regem o uso deste Serviço e o acordo que opera entre Você e a Empresa. Estes Termos e Condições estabelecem os direitos e obrigações de todos os usuários em relação ao uso do Serviço.

Seu acesso e uso do Serviço estão condicionados à Sua aceitação e conformidade com estes Termos e Condições. Estes Termos e Condições aplicam-se a todos os visitantes, usuários e outras pessoas que acessam ou usam o Serviço.

Ao acessar ou usar o Serviço, Você concorda em ficar vinculado a estes Termos e Condições. Se Você discordar de qualquer parte destes Termos e Condições, não poderá acessar o Serviço.

Responsabilidades do Usuário
=====================
Você é responsável por manter a confidencialidade de sua conta e senha, incluindo, mas não se limitando à restrição de acesso ao seu computador e/ou conta. Você concorda em aceitar a responsabilidade por todas e quaisquer atividades ou ações que ocorram sob sua conta e/ou senha.
  `;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <GateIcon className="mb-4 h-16 w-16 text-primary" />
          <h1 className="font-headline text-5xl font-bold text-primary">Porteiro</h1>
          <p className="mt-2 text-muted-foreground">Crie sua conta de acesso.</p>
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Criar uma Conta</CardTitle>
            <CardDescription>Preencha os detalhes abaixo para começar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" type="text" placeholder="João da Silva" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="joao.silva@exemplo.com" required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" type="text" placeholder="000.000.000-00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label>Termos de Responsabilidade</Label>
                <ScrollArea className="h-32 w-full rounded-md border p-4 text-sm">
                  {termsOfService}
                </ScrollArea>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Eu li e concordo com os termos de responsabilidade
                </label>
              </div>
              <Button type="submit" className="w-full">
                Criar Conta
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{' '}
              <Link href="/" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
