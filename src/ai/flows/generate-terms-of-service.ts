'use server';
/**
 * @fileOverview Generates a terms of service document based on input criteria.
 *
 * - generateTermsOfService - A function that generates the terms of service.
 * - GenerateTermsOfServiceInput - The input type for the generateTermsOfService function.
 * - GenerateTermsOfServiceOutput - The return type for the generateTermsOfService function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTermsOfServiceInputSchema = z.object({
  liability: z.string().describe('The liability terms of the service.'),
  dataUse: z.string().describe('How the user data will be used.'),
  serviceDescription: z.string().describe('A description of the service provided.'),
});
export type GenerateTermsOfServiceInput = z.infer<typeof GenerateTermsOfServiceInputSchema>;

const GenerateTermsOfServiceOutputSchema = z.object({
  termsOfService: z.string().describe('The generated terms of service document.'),
});
export type GenerateTermsOfServiceOutput = z.infer<typeof GenerateTermsOfServiceOutputSchema>;

export async function generateTermsOfService(input: GenerateTermsOfServiceInput): Promise<GenerateTermsOfServiceOutput> {
  return generateTermsOfServiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTermsOfServicePrompt',
  input: {schema: GenerateTermsOfServiceInputSchema},
  output: {schema: GenerateTermsOfServiceOutputSchema},
  prompt: `You are a legal expert specializing in generating terms of service documents.

  Based on the following criteria, generate a terms of service document:

  Service Description: {{{serviceDescription}}}
  Liability: {{{liability}}}
  Data Use: {{{dataUse}}}
  `,
});

const generateTermsOfServiceFlow = ai.defineFlow(
  {
    name: 'generateTermsOfServiceFlow',
    inputSchema: GenerateTermsOfServiceInputSchema,
    outputSchema: GenerateTermsOfServiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
