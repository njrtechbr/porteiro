'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GateIcon } from '@/components/gate-icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';
import { updateUserByAccessCode } from '@/lib/actions';
import { isValidCPF, formatCPF, cleanCPF } from '@/lib/utils';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isValidCode, setIsValidCode] = useState(false);

  // Novos estados para os dados do usuário
  const [userData, setUserData] = useState<{ name: string; email: string; cpf: string | null } | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Adicionar status ao userData
  const [userStatus, setUserStatus] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    setInviteCode(code);
    if (code) {
      setIsValidCode(true);
      setLoadingUser(true);
      fetch(`/api/user-by-invite-code?code=${code}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Usuário não encontrado ou convite inválido.');
          return res.json();
        })
        .then((data) => {
          setUserData({ name: data.name, email: data.email, cpf: data.cpf });
          setUserStatus(data.status || null);
          setFetchError(null);
        })
        .catch((err) => {
          setFetchError(err.message);
          setUserData(null);
        })
        .finally(() => setLoadingUser(false));
    } else {
      setIsValidCode(false);
      setUserData(null);
    }
  }, [searchParams]);

  // Estados controlados para os campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  
  // Estado para validação de CPF
  const [cpfError, setCpfError] = useState<string | null>(null);

  // Preencher os campos quando userData mudar
  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setCpf(userData.cpf || '');
    }
  }, [userData]);

  // Função para lidar com mudanças no CPF
  const handleCpfChange = (value: string) => {
    // Permitir apenas números, pontos e hífen
    const cleanValue = value.replace(/[^\d.-]/g, '');
    
    // Formatar automaticamente conforme o usuário digita
    let formattedValue = cleanValue;
    if (cleanValue.length <= 11 && /^\d+$/.test(cleanValue)) {
      if (cleanValue.length === 11) {
        formattedValue = formatCPF(cleanValue);
      }
    }
    
    setCpf(formattedValue);
    
    // Validar CPF se tiver 11 dígitos
    const onlyNumbers = cleanCPF(formattedValue);
    if (onlyNumbers.length === 11) {
      if (!isValidCPF(formattedValue)) {
        setCpfError('CPF inválido. Verifique os números digitados.');
      } else {
        setCpfError(null);
      }
    } else if (onlyNumbers.length > 0) {
      setCpfError(null); // Limpar erro enquanto ainda está digitando
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterLoading(true);
    
    if (!inviteCode) {
      setRegisterError('Código de convite ausente.');
      setRegisterLoading(false);
      return;
    }
    
    // Validar CPF antes de enviar
    if (cpf && !isValidCPF(cpf)) {
      setRegisterError('Por favor, insira um CPF válido.');
      setRegisterLoading(false);
      return;
    }
    
    try {
      const updatedUser = await updateUserByAccessCode(inviteCode, {
        name,
        email,
        cpf: cleanCPF(cpf), // Enviar CPF sem formatação
        password,
      });
      if (updatedUser) {
        router.push('/access');
      } else {
        setRegisterError('Não foi possível finalizar o cadastro.');
      }
    } catch (err) {
      setRegisterError('Erro ao finalizar cadastro.');
    } finally {
      setRegisterLoading(false);
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <GateIcon />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Finalize seu Cadastro</CardTitle>
          <CardDescription className="text-gray-600">
            Preencha as informações abaixo para completar seu acesso.
          </CardDescription>
        </CardHeader>

        {!isValidCode ? (
          <CardContent>
            <Alert>
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Código Inválido</AlertTitle>
              <AlertDescription>
                O código de convite não foi fornecido ou é inválido. Verifique o link que você recebeu.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link href="/" className="text-blue-600 hover:underline">
                Voltar à página inicial
              </Link>
            </div>
          </CardContent>
        ) : loadingUser ? (
          <CardContent>
            <p className="text-center">Carregando informações do convite...</p>
          </CardContent>
        ) : fetchError ? (
          <CardContent>
            <Alert>
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link href="/" className="text-blue-600 hover:underline">
                Voltar à página inicial
              </Link>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" type="text" placeholder="João da Silva" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="joao.silva@exemplo.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input 
                  id="cpf" 
                  type="text" 
                  placeholder="000.000.000-00" 
                  required 
                  value={cpf} 
                  onChange={e => handleCpfChange(e.target.value)}
                  className={cpfError ? 'border-red-500' : ''}
                />
                {cpfError && (
                  <p className="text-red-500 text-sm">{cpfError}</p>
                )}
                <p className="text-xs text-gray-500">
                  O CPF será validado automaticamente. Digite apenas os números.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Crie uma Senha</Label>
                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Termos de Responsabilidade</Label>
                <ScrollArea className="h-32 w-full rounded-md border p-4 text-sm">
                  {termsOfService}
                </ScrollArea>
              </div>
              
              {registerError && (
                <Alert>
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{registerError}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerLoading || !!cpfError}
              >
                {registerLoading ? 'Finalizando...' : 'Finalizar Cadastro'}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
