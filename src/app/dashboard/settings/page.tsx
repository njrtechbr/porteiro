'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'untested'>('untested');

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Configurações Salvas',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    }, 1500);
  };
  
  const handleTestConnection = () => {
      setIsTestingConnection(true);
      setConnectionStatus('untested');
      setTimeout(() => {
          const isSuccess = Math.random() > 0.3; // Simulate success/failure
          setConnectionStatus(isSuccess ? 'success' : 'error');
          setIsTestingConnection(false);
          toast({
              title: isSuccess ? "Conexão Bem-Sucedida" : "Falha na Conexão",
              description: isSuccess ? "O Porteiro conectou-se com sucesso ao seu Home Assistant." : "Verifique sua URL e Chave de API.",
              variant: isSuccess ? "default" : "destructive",
          })
      }, 2000);
  }

  return (
    <form onSubmit={handleSaveChanges} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
          <CardDescription>Configurações gerais da sua propriedade.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyName">Nome da Propriedade</Label>
            <Input id="propertyName" defaultValue="Casa da Família Silva" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Endereço</Label>
            <Input id="propertyAddress" defaultValue="Av. Principal, 123, São Paulo, SP" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acesso de Convidado</CardTitle>
          <CardDescription>Configure como os convites de acesso são gerenciados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Link de Cadastro para Convidados</Label>
             <div className="flex items-center space-x-2">
                <Input id="invite-link" value="/register?code=..." readOnly />
                <Button variant="outline" size="icon" type="button" onClick={() => {
                     navigator.clipboard.writeText("/register?code=...");
                     toast({title: "Modelo de link copiado!"});
                }}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <p className="text-sm text-muted-foreground">O link é gerado dinamicamente. Um código único será adicionado para cada convite.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas (modelo para WhatsApp)</Label>
            <Textarea
              id="welcomeMessage"
              rows={8}
              defaultValue={`Olá {NOME},

Você recebeu um convite de acesso para a nossa propriedade!

Para garantir sua entrada, por favor, complete seu cadastro no link abaixo:
{LINK_CADASTRO}

Seu código de acesso para os portões é: {CODIGO_ACESSO}
Portões liberados: {LISTA_PORTOES}

O seu acesso estará válido de {DATA_INICIO} até {DATA_FIM}.

Qualquer dúvida, estamos à disposição!`}
            />
             <p className="text-sm text-muted-foreground">As variáveis como &#123;NOME&#125; serão substituídas automaticamente.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integração Home Assistant</CardTitle>
          <CardDescription>Conecte o Porteiro à sua instância do Home Assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="ha-url">URL da API</Label>
            <Input id="ha-url" placeholder="http://homeassistant.local:8123" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="ha-key">Chave de API (Token de Longa Duração)</Label>
            <Input id="ha-key" type="password" placeholder="Cole sua chave de API aqui" />
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-background p-3">
             <div className="flex items-center gap-2">
                <Label>Status da Conexão:</Label>
                {connectionStatus === 'untested' && <Badge variant="outline">Não testado</Badge>}
                {connectionStatus === 'success' && <Badge variant="secondary" className="bg-green-100 text-green-800">Conectado</Badge>}
                {connectionStatus === 'error' && <Badge variant="destructive">Falha na conexão</Badge>}
             </div>
             <Button type="button" variant="outline" onClick={handleTestConnection} disabled={isTestingConnection}>
                {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Entidades dos Portões</CardTitle>
          <CardDescription>Insira os IDs das entidades do Home Assistant para cada portão.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="entity-nicaragua">Portão Principal (Av. Nicarágua)</Label>
            <Input id="entity-nicaragua" placeholder="switch.portao_nicaragua" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="entity-belgica">Portão de Serviço (Av. Bélgica)</Label>
            <Input id="entity-belgica" placeholder="switch.portao_belgica" />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
