'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { ChatSession } from '@/lib/types'
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatInterface } from '@/components/chat/chat-interface'
import { Logo } from './logo'
import { AuthGuard } from './auth-guard'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, addDoc, serverTimestamp, setDoc, doc, deleteDoc, orderBy, query } from 'firebase/firestore'
import { type ChatState } from '@/lib/actions'
import { getFirebaseAdmin } from '@/firebase/admin'

function AppPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, `users/${user.uid}/sessions`), orderBy('updatedAt', 'desc')) : null,
    [firestore, user]
  );
  const { data: sessions, isLoading: sessionsLoading } = useCollection<ChatSession>(sessionsQuery);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const activeSession = useMemo(() => {
    if (!sessions) return null;
    // If we have an activeSessionId, try to find it
    if (activeSessionId) {
      const found = sessions.find(s => s.id === activeSessionId);
      if (found) return found;
    }
    // If no active session or the active one is not found (e.g., deleted), default to the first one
    if (sessions.length > 0) {
      return sessions[0];
    }
    return null;
  }, [sessions, activeSessionId]);

  // Effect to set the active session ID when sessions load or change
  useEffect(() => {
    if (activeSession) {
      setActiveSessionId(activeSession.id);
    } else {
      setActiveSessionId(null);
    }
  }, [activeSession]);


  const handleNewChat = useCallback(async () => {
    if (!user) return;

    const newSessionData = {
      headline: 'New Chat',
      updatedAt: serverTimestamp(),
      userId: user.uid,
    }
    const sessionsCollection = collection(firestore, `users/${user.uid}/sessions`);
    const newDocRef = await addDoc(sessionsCollection, newSessionData);

    const welcomeMessage = {
        role: 'assistant',
        content: 'Hi! I am Nexus, your unified AI assistant. How can I help you today?',
        createdAt: serverTimestamp(),
    };
    const messagesCollection = collection(firestore, `users/${user.uid}/sessions/${newDocRef.id}/messages`);
    await addDoc(messagesCollection, welcomeMessage);

    setActiveSessionId(newDocRef.id)
  }, [user, firestore])

  const handleSessionUpdate = useCallback(async (updatedSessionData: Partial<ChatSession> & { id: string }) => {
    if (!user) return;
    const sessionRef = doc(firestore, `users/${user.uid}/sessions`, updatedSessionData.id);
    await setDoc(sessionRef, { ...updatedSessionData, updatedAt: serverTimestamp() }, { merge: true });
  }, [user, firestore]);


  const handleSessionDelete = useCallback(async (sessionId: string) => {
    if (!user) return;
    const sessionRef = doc(firestore, `users/${user.uid}/sessions`, sessionId);
    await deleteDoc(sessionRef);
    
    // If the deleted session was the active one, select a new one.
    if (activeSessionId === sessionId) {
      // Find the new list of sessions without the deleted one
      const remainingSessions = sessions?.filter(s => s.id !== sessionId) ?? [];
      // Set the new active session to the first of the remaining, or null if none exist
      setActiveSessionId(remainingSessions[0]?.id ?? null);
    }
  }, [user, firestore, activeSessionId, sessions]);


  const chatState: ChatState | null = useMemo(() => {
    if (!activeSession || !user) return null;
    return {
      sessionId: activeSession.id,
      userId: user.uid,
      headline: activeSession.headline,
      messages: [], // messages are now fetched inside the server action
    }
  }, [activeSession, user])

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col">
        <header className="flex h-20 shrink-0 items-center justify-center border-b px-4 text-center">
             <div className="absolute left-4">
                <SidebarTrigger className="md:hidden" />
             </div>
             <div className="flex flex-col items-center">
                <Logo />
                <p className="mt-1 text-sm text-muted-foreground">Your unified AI assistant</p>
             </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <ChatSidebar
            sessions={sessions ?? []}
            activeSessionId={activeSession?.id ?? null}
            onSessionSelect={setActiveSessionId}
            onNewChat={handleNewChat}
            onSessionDelete={handleSessionDelete}
            onSessionUpdate={handleSessionUpdate}
            isLoading={sessionsLoading}
          />
          <main className="flex flex-1 flex-col">
            <ChatInterface
              key={activeSession?.id}
              chatState={chatState}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function Home() {
    return (
        <AuthGuard>
            <AppPage />
        </AuthGuard>
    )
}
