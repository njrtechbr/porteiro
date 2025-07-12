'use server';
/**
 * @fileOverview Generates a terms of service document based on input criteria.
 *
 * - generateTermsOfService - A function that generates the terms of service.
 * - GenerateTermsOfServiceInput - The input type for the generateTermsOfService function.
 * - GenerateTermsOfServiceOutput - The return type for the generateTermsOfService function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit/zod';

const GenerateTermsOfServiceInputSchema = z.object({
  liability: z.string().describe('The liability terms of the service.'),
  dataUse: z.string().describe('How the user data will be used.'),
  serviceDescription: z
    .string()
    .describe('A description of the service provided.'),
});
export type GenerateTermsOfServiceInput = z.infer<
  typeof GenerateTermsOfServiceInputSchema
>;

const GenerateTermsOfServiceOutputSchema = z.object({
  termsOfService: z
    .string()
    .describe('The generated terms of service document.'),
});
export type GenerateTermsOfServiceOutput = z.infer<
  typeof GenerateTermsOfServiceOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'generateTermsOfServicePrompt',
  input: {schema: GenerateTermsOfServiceInputSchema},
  output: {schema: GenerateTermsOfServiceOutputSchema},
  prompt: `Você é um especialista jurídico especializado na geração de documentos de termos de serviço.
  Gere o documento em português do Brasil (pt-br).

  Com base nos seguintes critérios, gere um documento de termos de serviço:

  Descrição do Serviço: {{{serviceDescription}}}
  Responsabilidade: {{{liability}}}
  Uso de Dados: {{{dataUse}}}
  `,
});

const generateTermsOfServiceFlow = ai.defineFlow(
  {
    name: 'generateTermsOfServiceFlow',
    inputSchema: GenerateTermsOfServiceInputSchema,
    outputSchema: GenerateTermsOfServiceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateTermsOfService(
  input: GenerateTermsOfServiceInput
): Promise<GenerateTermsOfServiceOutput> {
  return generateTermsOfServiceFlow(input);
}
