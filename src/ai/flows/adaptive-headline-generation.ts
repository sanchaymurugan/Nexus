'use server';

/**
 * @fileOverview A flow for generating adaptive headlines for chat conversations.
 *
 * - generateHeadline - A function that generates a headline based on conversation content.
 * - GenerateHeadlineInput - The input type for the generateHeadline function.
 * - GenerateHeadlineOutput - The return type for the generateHeadline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeadlineInputSchema = z.object({
  conversationContent: z
    .string()
    .describe('The content of the chat conversation.'),
});

export type GenerateHeadlineInput = z.infer<typeof GenerateHeadlineInputSchema>;

const GenerateHeadlineOutputSchema = z.object({
  headline: z.string().describe('A relevant headline for the conversation.'),
});

export type GenerateHeadlineOutput = z.infer<typeof GenerateHeadlineOutputSchema>;

export async function generateHeadline(input: GenerateHeadlineInput): Promise<GenerateHeadlineOutput> {
  return generateHeadlineFlow(input);
}

const headlinePrompt = ai.definePrompt({
  name: 'headlinePrompt',
  input: {schema: GenerateHeadlineInputSchema},
  output: {schema: GenerateHeadlineOutputSchema},
  prompt: `You are an AI assistant that generates headlines for chat conversations.

  Generate a concise and relevant headline based on the following conversation content:

  """{{conversationContent}}"""
  `,
});

const generateHeadlineFlow = ai.defineFlow(
  {
    name: 'generateHeadlineFlow',
    inputSchema: GenerateHeadlineInputSchema,
    outputSchema: GenerateHeadlineOutputSchema,
  },
  async input => {
    const {output} = await headlinePrompt(input);
    return output!;
  }
);
