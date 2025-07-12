'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const homeAssistantFormSchema = z.object({
  apiUrl: z.string().url({ message: "Por favor, insira uma URL válida." }),
  apiKey: z.string().min(1, { message: "A chave de API não pode estar em branco." }),
})

type HomeAssistantFormValues = z.infer<typeof homeAssistantFormSchema>

export default function HomeAssistantPage() {
  const form = useForm<HomeAssistantFormValues>({
    resolver: zodResolver(homeAssistantFormSchema),
    defaultValues: {
      apiUrl: "",
      apiKey: "",
    },
  })
  
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(data: HomeAssistantFormValues) {
    setIsLoading(true);
    console.log(data)
    
    // Simulação de salvamento e teste de conexão
    setTimeout(() => {
        toast({
            title: "Configurações Salvas",
            description: "Suas credenciais do Home Assistant foram salvas com sucesso.",
        })
        setIsLoading(false);
    }, 1500)
  }

  return (
     <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Home Assistant</h3>
        <p className="text-sm text-muted-foreground">
          Configure a integração com sua instância do Home Assistant.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Configuração da API</CardTitle>
            <CardDescription>Forneça a URL e a chave de API de longa duração do seu Home Assistant.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="apiUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>URL da API</FormLabel>
                    <FormControl>
                        <Input placeholder="http://homeassistant.local:8123" {...field} />
                    </FormControl>
                    <FormDescription>
                        A URL base da sua instância do Home Assistant.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Chave de API (Token de Longa Duração)</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Cole sua chave de API aqui" {...field} />
                    </FormControl>
                    <FormDescription>
                        Crie um token de longa duração no seu perfil do Home Assistant.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Configurações
                </Button>
            </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  )
}
