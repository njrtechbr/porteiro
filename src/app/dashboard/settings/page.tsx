'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, Loader2, FileText, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { TosGenerator } from '@/components/tos-generator';
import { SettingsHelper } from '@/lib/settings';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'untested'>('untested');
  
  // Estados para configurações
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [termoUso, setTermoUso] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [haUrl, setHaUrl] = useState('');
  const [haToken, setHaToken] = useState('');
  const [gateNicaraguaEntity, setGateNicaraguaEntity] = useState('');
  const [gateBelgicaEntity, setGateBelgicaEntity] = useState('');
  
  // Estados de loading
  const [isSavingTermo, setIsSavingTermo] = useState(false);
  const [showTOSGenerator, setShowTOSGenerator] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Carregar configurações existentes
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      setIsLoadingSettings(true);
      try {
        // Carregar todas as configurações em paralelo
        const [
          propName,
          propAddress,
          terms,
          welcome,
          url,
          token,
          nicaraguaEntity,
          belgicaEntity
        ] = await Promise.all([
          SettingsHelper.getPropertyName(),
          SettingsHelper.getPropertyAddress(),
          SettingsHelper.getTermsOfService(),
          SettingsHelper.getWelcomeMessage(),
          SettingsHelper.getHomeAssistantUrl(),
          SettingsHelper.getHomeAssistantToken(),
          SettingsHelper.getGateNicaraguaEntity(),
          SettingsHelper.getGateBelgicaEntity()
        ]);

        setPropertyName(propName);
        setPropertyAddress(propAddress);
        setTermoUso(terms);
        setWelcomeMessage(welcome);
        setHaUrl(url);
        setHaToken(token);
        setGateNicaraguaEntity(nicaraguaEntity);
        setGateBelgicaEntity(belgicaEntity);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: 'Erro ao Carregar',
          description: 'Não foi possível carregar as configurações.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  const handleSaveTermoUso = async () => {
    setIsSavingTermo(true);
    try {
      await SettingsHelper.setTermsOfService(termoUso);
      
      toast({
        title: 'Termo de Uso Salvo',
        description: 'O termo de uso foi atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar termo de uso:', error);
      toast({
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar o termo de uso.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTermo(false);
    }
  };

  const handleTOSGenerated = (novoTermo: string) => {
    setTermoUso(novoTermo);
    setShowTOSGenerator(false);
    toast({
      title: 'Termo Gerado',
      description: 'Um novo termo foi gerado. Revise e salve as alterações.',
    });
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Salvar todas as configurações em paralelo
      await Promise.all([
        SettingsHelper.setPropertyName(propertyName),
        SettingsHelper.setPropertyAddress(propertyAddress),
        SettingsHelper.setWelcomeMessage(welcomeMessage),
        SettingsHelper.setHomeAssistantUrl(haUrl),
        SettingsHelper.setHomeAssistantToken(haToken),
        SettingsHelper.setGateNicaraguaEntity(gateNicaraguaEntity),
        SettingsHelper.setGateBelgicaEntity(gateBelgicaEntity)
      ]);

      toast({
        title: 'Configurações Salvas',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
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
            <Input 
              id="propertyName" 
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Endereço</Label>
            <Input 
              id="propertyAddress" 
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
            />
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
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
            />
             <p className="text-sm text-muted-foreground">As variáveis como &#123;NOME&#125; serão substituídas automaticamente.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Termo de Uso
          </CardTitle>
          <CardDescription>Configure o termo de uso exibido para os usuários.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="termoUso">Conteúdo do Termo de Uso</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTOSGenerator(true)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar com IA
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveTermoUso}
                  disabled={isSavingTermo}
                  size="sm"
                >
                  {isSavingTermo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Termo
                </Button>
              </div>
            </div>
            <Textarea
              id="termoUso"
              value={termoUso}
              onChange={(e) => setTermoUso(e.target.value)}
              rows={15}
              placeholder="Digite o termo de uso aqui..."
            />
            <p className="text-sm text-muted-foreground">
              Este termo será exibido aos usuários durante o cadastro e acesso ao sistema.
            </p>
          </div>
          
          {showTOSGenerator && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <TosGenerator onGenerated={handleTOSGenerated} />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTOSGenerator(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
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
            <Input 
              id="ha-url" 
              placeholder="http://homeassistant.local:8123"
              value={haUrl}
              onChange={(e) => setHaUrl(e.target.value)}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="ha-key">Chave de API (Token de Longa Duração)</Label>
            <Input 
              id="ha-key" 
              type="password" 
              placeholder="Cole sua chave de API aqui"
              value={haToken}
              onChange={(e) => setHaToken(e.target.value)}
            />
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
            <Input 
              id="entity-nicaragua" 
              placeholder="switch.portao_nicaragua"
              value={gateNicaraguaEntity}
              onChange={(e) => setGateNicaraguaEntity(e.target.value)}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="entity-belgica">Portão de Serviço (Av. Bélgica)</Label>
            <Input 
              id="entity-belgica" 
              placeholder="switch.portao_belgica"
              value={gateBelgicaEntity}
              onChange={(e) => setGateBelgicaEntity(e.target.value)}
            />
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
