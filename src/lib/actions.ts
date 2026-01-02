'use server'

import { generateHeadline } from "@/ai/flows/adaptive-headline-generation"
import { aiServiceInteraction } from "@/ai/flows/ai-service-interaction"
import type { Message } from "@/lib/types"

export type ChatState = {
  messages: Message[]
  headline?: string
}

export async function submitMessage(
  currentState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const userMessageContent = formData.get('message') as string

  if (!userMessageContent?.trim()) {
    return currentState
  }

  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content: userMessageContent,
  }

  const messagesWithUser = [...currentState.messages, userMessage]

  const aiResponse = await aiServiceInteraction({
    userQuery: userMessageContent,
    serviceType: 'general', // Placeholder
    userDetails: 'user-123', // Placeholder
  })

  const assistantMessage: Message = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: aiResponse.response,
  }

  const messagesWithAssistant = [...messagesWithUser, assistantMessage]

  let newHeadline = currentState.headline
  // Generate headline for the first message exchange
  if (messagesWithAssistant.length === 2) {
    const conversationContent = messagesWithAssistant
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')
    const headlineResponse = await generateHeadline({ conversationContent })
    newHeadline = headlineResponse.headline
  }

  return {
    messages: messagesWithAssistant,
    headline: newHeadline,
  }
}
