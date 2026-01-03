'use server'

import { generateHeadline } from "@/ai/flows/adaptive-headline-generation"
import { aiServiceInteraction } from "@/ai/flows/ai-service-interaction"
import type { Message } from "@/lib/types"

export type ChatState = {
  messages: Message[]
  headline?: string
  sessionId: string
  userId: string
}

export async function continueConversation(
  userId: string,
  sessionId: string,
  messages: Message[]
) {
  const userMessage = messages.findLast(m => m.role === 'user');
  if (!userMessage) {
    // Should not happen, but as a safeguard.
    return null;
  }

  const aiResponse = await aiServiceInteraction({
    userQuery: userMessage.content,
    serviceType: 'general', // Placeholder
    userDetails: userId,
  })

  // Generate headline for the first message exchange
  let headline = null
  if (messages.length <= 2) {
    const conversationContent = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')
    const headlineResponse = await generateHeadline({ conversationContent })
    headline = headlineResponse.headline
  }

  return {
    aiMessage: aiResponse.response,
    headline: headline,
  }
}
