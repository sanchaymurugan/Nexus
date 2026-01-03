'use server'

import { generateHeadline } from "@/ai/flows/adaptive-headline-generation"
import { aiServiceInteraction } from "@/ai/flows/ai-service-interaction"
import type { Message } from "@/lib/types"
import { getFirebaseAdmin } from "@/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"

export type ChatState = {
  messages: Message[]
  headline?: string
  sessionId: string
  userId: string
}

async function getMessages(userId: string, sessionId: string) {
  const { firestore } = getFirebaseAdmin()
  const messages: Message[] = []
  const messagesRef = firestore.collection('users').doc(userId).collection('sessions').doc(sessionId).collection('messages');
  const querySnapshot = await messagesRef.orderBy('createdAt', 'asc').get();
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    messages.push({ 
        id: doc.id, 
        ...data,
        createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate() : new Date(),
    } as Message)
  })
  return messages;
}

export async function submitMessage(
  currentState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const userMessageContent = formData.get('message') as string

  if (!userMessageContent?.trim()) {
    return currentState
  }

  const { firestore } = getFirebaseAdmin()

  const userMessage: Omit<Message, 'id'> = {
    role: 'user',
    content: userMessageContent,
    createdAt: FieldValue.serverTimestamp() as any,
  }

  const messagesRef = firestore.collection('users').doc(currentState.userId).collection('sessions').doc(currentState.sessionId).collection('messages');
  await messagesRef.add(userMessage);

  const aiResponse = await aiServiceInteraction({
    userQuery: userMessageContent,
    serviceType: 'general', // Placeholder
    userDetails: currentState.userId,
  })

  const assistantMessage: Omit<Message, 'id'> = {
    role: 'assistant',
    content: aiResponse.response,
    createdAt: FieldValue.serverTimestamp() as any,
  }
  await messagesRef.add(assistantMessage);

  const allMessages = await getMessages(currentState.userId, currentState.sessionId);


  let newHeadline = currentState.headline
  // Generate headline for the first message exchange
  if (allMessages.length === 2 && (!newHeadline || newHeadline === 'New Chat')) {
    const conversationContent = allMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')
    const headlineResponse = await generateHeadline({ conversationContent })
    newHeadline = headlineResponse.headline

    const sessionRef = firestore.collection('users').doc(currentState.userId).collection('sessions').doc(currentState.sessionId);
    await sessionRef.set({ headline: newHeadline, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }

  return {
    ...currentState,
    messages: allMessages,
    headline: newHeadline,
  }
}
