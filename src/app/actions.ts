// @/app/actions.ts
'use server';

import {
  generateTermsOfService,
  type GenerateTermsOfServiceInput,
} from '@/ai/flows/generate-terms-of-service';

export async function createTermsOfService(
  input: GenerateTermsOfServiceInput
): Promise<{ success: boolean; terms?: string; error?: string }> {
  try {
    const output = await generateTermsOfService(input);
    if (output?.termsOfService) {
      return { success: true, terms: output.termsOfService };
    }
    return { success: false, error: 'Failed to generate content.' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
