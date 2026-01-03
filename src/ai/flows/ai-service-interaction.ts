'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-powered service interaction.
 *
 * It allows users to interact with external services like banking or booking appointments through a chat interface.
 * - aiServiceInteraction - The main function to initiate the AI service interaction flow.
 * - AIServiceInteractionInput - The input type for the aiServiceInteraction function.
 * - AIServiceInteractionOutput - The output type for the aiServiceInteraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIServiceInteractionInputSchema = z.object({
  userQuery: z.string().describe('The user query or request.'),
  serviceType: z.string().describe('The type of service the user wants to interact with (e.g., banking, appointment booking).'),
  userDetails: z.string().optional().describe('Optional user details for authentication or context.'),
  generateHeadline: z.boolean().optional().describe('Whether to generate a headline for the conversation.'),
  conversationContent: z.string().optional().describe('The full conversation content, required if generateHeadline is true.'),
});
export type AIServiceInteractionInput = z.infer<typeof AIServiceInteractionInputSchema>;

const AIServiceInteractionOutputSchema = z.object({
  response: z.string().describe('The AI-generated response after interacting with the external service.'),
  success: z.boolean().describe('Indicates whether the service interaction was successful.'),
  headline: z.string().optional().describe('A concise and relevant headline for the conversation, if requested.'),
});
export type AIServiceInteractionOutput = z.infer<typeof AIServiceInteractionOutputSchema>;

export async function aiServiceInteraction(input: AIServiceInteractionInput): Promise<AIServiceInteractionOutput> {
  return aiServiceInteractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiServiceInteractionPrompt',
  input: {schema: AIServiceInteractionInputSchema},
  output: {schema: AIServiceInteractionOutputSchema},
  prompt: `You are an AI assistant designed to help users interact with external services like banking and appointment booking.

The user wants to interact with a service of type: {{{serviceType}}}.

The user's query is: {{{userQuery}}}.

Here are some user details (if available): {{{userDetails}}}

Based on the user's query, interact with the appropriate service, and respond to the user in a clear and concise manner.

Ensure you confirm success when the user request is fulfilled.

{{#if generateHeadline}}
You MUST also generate a concise and relevant headline based on the following conversation content. The headline should be no more than a few words.
Conversation:
"""
{{{conversationContent}}}
"""
{{/if}}
`,
});

const aiServiceInteractionFlow = ai.defineFlow(
  {
    name: 'aiServiceInteractionFlow',
    inputSchema: AIServiceInteractionInputSchema,
    outputSchema: AIServiceInteractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
