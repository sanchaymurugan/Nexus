'use server'

import { generateHeadline } from "@/ai/flows/adaptive-headline-generation"
import { aiServiceInteraction } from "@/ai/flows/ai-service-interaction"
import type { Message } from "@/lib/types"
import { addDoc, collection, doc, serverTimestamp, setDoc, getDocs } from "firebase/firestore"
import { getSdks } from "@/firebase"

export type ChatState = {
  messages: Message[]
  headline?: string
  sessionId: string
  userId: string
}

async function getMessages(userId: string, sessionId: string) {
  const { firestore } = getSdks()
  const messages: Message[] = []
  const messagesRef = collection(firestore, 'users', userId, 'sessions', sessionId, 'messages')
  const querySnapshot = await getDocs(messagesRef)
  querySnapshot.forEach((doc) => {
    messages.push({ id: doc.id, ...doc.data() } as Message)
  })
  return messages.sort((a, b) => (a.createdAt as any) - (b.createdAt as any));
}

export async function submitMessage(
  currentState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const userMessageContent = formData.get('message') as string

  if (!userMessageContent?.trim()) {
    return currentState
  }

  const { firestore } = getSdks()

  const userMessage: Omit<Message, 'id'> = {
    role: 'user',
    content: userMessageContent,
    createdAt: serverTimestamp(),
  }

  const messagesRef = collection(firestore, 'users', currentState.userId, 'sessions', currentState.sessionId, 'messages');
  await addDoc(messagesRef, userMessage);

  const aiResponse = await aiServiceInteraction({
    userQuery: userMessageContent,
    serviceType: 'general', // Placeholder
    userDetails: currentState.userId,
  })

  const assistantMessage: Omit<Message, 'id'> = {
    role: 'assistant',
    content: aiResponse.response,
    createdAt: serverTimestamp(),
  }
  await addDoc(messagesRef, assistantMessage);

  const allMessages = await getMessages(currentState.userId, currentState.sessionId);


  let newHeadline = currentState.headline
  // Generate headline for the first message exchange
  if (allMessages.length === 2 && (!newHeadline || newHeadline === 'New Chat')) {
    const conversationContent = allMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')
    const headlineResponse = await generateHeadline({ conversationContent })
    newHeadline = headlineResponse.headline

    const sessionRef = doc(firestore, 'users', currentState.userId, 'sessions', currentState.sessionId);
    await setDoc(sessionRef, { headline: newHeadline, updatedAt: serverTimestamp() }, { merge: true });
  }

  return {
    ...currentState,
    messages: allMessages,
    headline: newHeadline,
  }
}
