'use client'

import { useState, useCallback } from 'react'
import type { ChatSession } from '@/lib/types'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatInterface } from '@/components/chat/chat-interface'
import { Logo } from './logo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles } from 'lucide-react'

const initialSessions: ChatSession[] = [
  {
    id: 'session-1',
    headline: 'Booking a flight to Bali',
    messages: [
      { id: 'msg-1', role: 'user', content: 'I need to book a flight for 2 to Bali for next month.' },
      { id: 'msg-2', role: 'assistant', content: 'Of course! What are your preferred travel dates and airline?' },
    ],
  },
  {
    id: 'session-2',
    headline: 'Monthly budget review',
    messages: [
      { id: 'msg-3', role: 'user', content: 'Show me my spending for last month.' },
      { id: 'msg-4', role: 'assistant', content: 'Here is your spending report for last month. You spent the most on dining out.' },
    ],
  },
];

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialSessions[0]?.id ?? null
  )

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      headline: 'New Chat',
      messages: [],
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
  }

  const handleSessionUpdate = useCallback((updatedSession: ChatSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    )
  }, []);

  const handleSessionDelete = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const remainingSessions = prev.filter((s) => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remainingSessions[0]?.id ?? null);
      }
      return remainingSessions;
    });
  }, [activeSessionId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  return (
    <SidebarProvider>
      <div className="flex h-full flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1 flex justify-center">
            <Logo />
          </div>
          <div className="w-8 md:hidden" />
        </header>
        <div className="flex flex-1 overflow-hidden">
          <ChatSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionSelect={setActiveSessionId}
            onNewChat={handleNewChat}
            onSessionDelete={handleSessionDelete}
            onSessionUpdate={handleSessionUpdate}
          />
          <SidebarInset>
            <ChatInterface
              key={activeSessionId}
              session={activeSession ?? null}
              onSessionUpdate={handleSessionUpdate}
            />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
