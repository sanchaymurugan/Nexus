'use client'

import { useState, useCallback, useMemo } from 'react'
import type { ChatSession, Message } from '@/lib/types'
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
import { ChatState } from '@/lib/actions'

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
    if (activeSessionId) {
      return sessions.find(s => s.id === activeSessionId) ?? null;
    }
    return sessions[0] ?? null;
  }, [sessions, activeSessionId]);

  const handleNewChat = useCallback(async () => {
    if (!user) return;
    const newSessionData = {
      headline: 'New Chat',
      updatedAt: serverTimestamp(),
      userId: user.uid,
    }
    const sessionsCollection = collection(firestore, `users/${user.uid}/sessions`);
    const newDocRef = await addDoc(sessionsCollection, newSessionData);
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
    
    if (activeSessionId === sessionId) {
      setActiveSessionId(sessions && sessions.length > 1 ? sessions.filter(s => s.id !== sessionId)[0]?.id ?? null : null);
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
        <header className="flex h-20 items-center justify-center border-b px-4 text-center shrink-0">
             <div className="absolute left-4">
                <SidebarTrigger className="md:hidden" />
             </div>
             <div className="flex flex-col items-center">
                <Logo />
                <p className="text-sm text-muted-foreground mt-1">Your unified AI assistant</p>
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
          <main className="flex-1 flex flex-col">
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
