'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTermsOfService } from '@/lib/ai/actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from './ui/scroll-area';

const FormSchema = z.object({
  serviceDescription: z.string().min(10, 'Forneça uma descrição de serviço mais detalhada.'),
  liability: z.string().min(10, 'Descreva os termos de responsabilidade.'),
  dataUse: z.string().min(10, 'Explique como os dados do usuário serão usados.'),
});

type FormValues = z.infer<typeof FormSchema>;

export function TosGenerator() {
  const [generatedTerms, setGeneratedTerms] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      serviceDescription: 'Um sistema de controle de acesso inteligente para propriedades residenciais, principalmente para gerenciar o acesso de hóspedes do Airbnb e familiares.',
      liability: 'O proprietário não se responsabiliza por quaisquer ferimentos ou danos que ocorram na propriedade. Os usuários são responsáveis por sua própria segurança e pela segurança de seus pertences. Qualquer dano ao portão ou à propriedade causado pelo usuário será de sua responsabilidade financeira.',
      dataUse: 'Os dados do usuário (nome, e-mail) são coletados apenas para fins de identificação e gerenciamento de acesso. Não serão compartilhados com terceiros. Os registros de acesso são mantidos para segurança e auditoria.',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError('');
    setGeneratedTerms('');

    const result = await createTermsOfService(data);

    if (result.success && result.terms) {
      setGeneratedTerms(result.terms);
    } else {
      setError(result.error || 'Ocorreu um erro desconhecido.');
    }

    setIsLoading(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="serviceDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição do Serviço</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descreva o serviço fornecido..." rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="liability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Termos de Responsabilidade</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descreva os termos de responsabilidade..." rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dataUse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Política de Uso de Dados</FormLabel>
                <FormControl>
                  <Textarea placeholder="Explique como os dados do usuário serão usados..." rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar Documento
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-headline">Documento Gerado</h3>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <ScrollArea className="h-[450px] w-full rounded-md border bg-muted/50 p-4">
          {isLoading ? (
             <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : generatedTerms ? (
            <pre className="whitespace-pre-wrap text-sm font-sans">{generatedTerms}</pre>
          ) : (
            <p className="text-muted-foreground text-center pt-4">Seus Termos de Serviço gerados aparecerão aqui.</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
