'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTermsOfService } from '@/app/actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from './ui/scroll-area';

const FormSchema = z.object({
  serviceDescription: z.string().min(10, 'Please provide a more detailed service description.'),
  liability: z.string().min(10, 'Please describe the liability terms.'),
  dataUse: z.string().min(10, 'Please explain how user data will be used.'),
});

type FormValues = z.infer<typeof FormSchema>;

export function TosGenerator() {
  const [generatedTerms, setGeneratedTerms] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      serviceDescription: 'A smart gate access control system for residential properties, primarily for managing access for Airbnb guests and family members.',
      liability: 'The homeowner is not liable for any injuries or damages that occur on the property. Users are responsible for their own safety and the security of their belongings. Any damage to the gate or property caused by the user will be their financial responsibility.',
      dataUse: 'User data (name, email) is collected for identification and access management purposes only. It will not be shared with third parties. Access logs are maintained for security and auditing.',
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
      setError(result.error || 'An unknown error occurred.');
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
                <FormLabel>Service Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the service provided..." rows={4} {...field} />
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
                <FormLabel>Liability Terms</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe liability terms..." rows={4} {...field} />
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
                <FormLabel>Data Use Policy</FormLabel>
                <FormControl>
                  <Textarea placeholder="Explain how user data will be used..." rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Document
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-headline">Generated Document</h3>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
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
            <p className="text-muted-foreground text-center pt-4">Your generated Terms of Service will appear here.</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
